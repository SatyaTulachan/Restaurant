# Runbook: Restaurant Management System

Operational notes for running, checking and troubleshooting the stack (Spring Boot backend, React frontend, MySQL) with Docker Compose and on Kubernetes (minikube).

## 1. Components and ports

| Component | Image / source | Port | Notes |
|---|---|---|---|
| MySQL | `mysql:8` | 3306 | Database `restaurant_db`, data on a volume (Compose) or PVC (Kubernetes) |
| Backend | `Dockerfile` (repo root) | 8080 | Reads `DB_PASSWORD` and `SPRING_DATASOURCE_URL` from the environment |
| Frontend | `frontend/Dockerfile` | 3000 (Compose) / 80 in container | Static files served by nginx. API URL is baked in at build time (`VITE_API_URL`) |

Credentials live in `.env` (gitignored) for Compose and in a Kubernetes Secret named `db-secret` for the cluster. Never commit real passwords.

## 2. Quick health checks

**Docker Compose**
```bash
docker compose ps                      # all three services Up, mysql healthy
docker compose logs backend --tail=20  # look for "Started RestaurantApplication"
curl http://localhost:8080/api/categories   # returns [] or JSON
```

**Kubernetes**
```bash
kubectl get pods,svc,pvc               # pods Running 1/1, PVC Bound
kubectl logs deploy/backend --tail=20
kubectl describe pod -l app=backend    # check Events at the bottom
```

## 3. Troubleshooting

Each entry: symptom, how to check, fix, and when to escalate.

### 3.1 `permission denied ... /var/run/docker.sock`
- **Check:** `groups` does not include `docker`.
- **Fix:** `sudo usermod -aG docker $USER`, then log out and back in (or `newgrp docker` for one terminal). Confirm with `docker ps`.
- **Escalate if:** Docker daemon is not running (`systemctl status docker`) and cannot be started.

### 3.2 `docker compose` says unknown command or unknown flag `--build`
- **Check:** `docker compose version` fails.
- **Fix:** install the Compose plugin with the system package manager (on Arch/CachyOS: `sudo pacman -S docker-compose`), or place the plugin binary in `~/.docker/cli-plugins/docker-compose` and make it executable.

### 3.3 `address already in use` (ports 8080, 3000 or 3306)
- **Check:** `sudo ss -ltnp | grep 8080`
- **Fix:** stop the process holding the port (IDE run of the backend, an old `restaurant-mysql` container, a stray `java` process). For containers: `docker stop <name>` / `docker rm <name>`. Then `docker compose down` and `docker compose up --build`.

### 3.4 Backend exits or restarts with a database connection error
- **Check:** `docker compose logs backend` or `kubectl logs deploy/backend`. Look for `Communications link failure` or `Access denied`.
- **Likely causes and fixes:**
  - MySQL not ready yet: Compose waits on the MySQL healthcheck, and Kubernetes uses an init container. Wait for MySQL to show healthy / `1/1`.
  - Wrong password: `.env` (Compose) or `db-secret` (Kubernetes) does not match the password MySQL was first created with. MySQL only reads `MYSQL_ROOT_PASSWORD` on first start of an empty volume. Either use the original password or reset the volume (see 3.9, this deletes data).
  - Wrong host: inside Compose and Kubernetes the host is `mysql`, not `localhost`.
- **Escalate if:** credentials are correct and MySQL is healthy but the backend still cannot connect.

### 3.5 Frontend loads but shows no data or API errors
- **Check:** browser DevTools Console and Network tab. A CORS error means the API rejected the origin. A request to the wrong URL means the API URL is wrong.
- **Fix (CORS):** the backend allows `http://localhost:5173` and `http://localhost:3000` by default. For another origin set `APP_CORS_ALLOWED_ORIGINS` (comma-separated) on the backend.
- **Fix (API URL):** `VITE_API_URL` is baked in at build time. Change it and rebuild the frontend image (`docker compose up --build`).
- **Also check:** the backend is reachable (`curl http://localhost:8080/api/categories`). On Kubernetes, both `port-forward` commands must be running.

### 3.6 Empty data after restart
- **Check:** was `docker compose down -v` used, or was a new volume or PVC created?
- **Fix:** `docker compose down` (without `-v`) keeps data. Restore from a backup if one exists: `docker exec -i restaurant-mysql mysql -uroot -p restaurant_db < backup.sql`.
- **Prevention:** take a dump before destructive steps: `docker exec restaurant-mysql mysqldump -uroot -p restaurant_db > backup.sql`.

### 3.7 CI: backend job fails
- **Check:** open the failed step in the GitHub Actions tab.
- **Common causes:**
  - Tests need a live database: the workflow starts a MySQL service container and sets `DB_PASSWORD`. Check both match.
  - Java version mismatch: project uses Java 17 (`pom.xml`, Dockerfile, `setup-java`).
- **Fix:** reproduce locally with `mvn -B verify` against a running MySQL, then fix and push.

### 3.7a CI does not run at all
- **Check:** `git ls-files .github` shows `.github/workflows/ci.yml`.
- **Fix:** the workflow must be at exactly `.github/workflows/ci.yml` and pushed to the branch.

### 3.7b Files missing from the repo or the CI build
- **Check:** `git check-ignore -v <path>` shows which `.gitignore` rule hides the file. (A `frontend/` rule previously hid the whole React app.)
- **Fix:** remove or narrow the rule, then `git add` the files.

### 3.8 Kubernetes: pod stuck in `ErrImageNeverPull` or `ImagePullBackOff`
- **Check:** `kubectl describe pod <name>` and `minikube image ls | grep restaurant`.
- **Fix:** minikube has its own Docker. Build the images, then load them: `minikube image load restaurant-backend:local` and `minikube image load restaurant-frontend:local`. The manifests use `imagePullPolicy: Never`.

### 3.9 Kubernetes: `CrashLoopBackOff`
- **Check:** `kubectl logs deploy/backend` (add `--previous` for the last crashed run), then `kubectl describe pod`.
- **Common causes:** MySQL not ready, `db-secret` missing (`secret "db-secret" not found`), or wrong password.
- **Fix:** create the Secret if missing: `kubectl create secret generic db-secret --from-env-file=.env`. Then restart: `kubectl rollout restart deploy/backend`.

### 3.10 Kubernetes: pod `Pending` or PVC not `Bound`
- **Check:** `kubectl describe pvc mysql-pvc` and `kubectl describe pod <name>`.
- **Fix:** confirm minikube is running (`minikube status`) and a default storage class exists (`kubectl get storageclass`). Restart with `minikube start --driver=docker` if the cluster is stopped.
- **Escalate if:** no storage class is available and one cannot be created.

### 3.11 `port-forward` connection refused or stops
- **Check:** the pod is `Running` and `1/1` (`kubectl get pods`).
- **Fix:** restart the `kubectl port-forward` command. It drops when the pod restarts and must be re-run.

## 4. Routine operations

```bash
# Compose
docker compose up --build        # build and start
docker compose down              # stop, keep data
docker compose down -v           # stop and DELETE data

# Kubernetes (after minikube start)
kubectl apply -f k8s/
kubectl rollout restart deploy/backend
kubectl scale deploy/frontend --replicas=2
kubectl delete pod -l app=mysql  # self-healing test: pod is recreated, data stays on the PVC
```

## 5. Security and data handling

- Credentials are kept out of code and git: `.env` is gitignored, and the Kubernetes Secret is created from the command line.
- `.env.example` holds placeholders only.
- Kubernetes Secrets are base64-encoded, not encrypted, so cluster access should be restricted in any real deployment.
- This is a local development setup. For production, add an Ingress, resource limits, proper health probes and an image registry.

## 6. When to escalate

Escalate (to the project owner or a senior engineer) when:
- A fix here does not resolve the issue after the listed checks.
- Data loss is possible or has occurred.
- A credential may have been exposed (for example a real password committed to git). Change the password first, then report it.
- The fix needs access or permissions you do not have.

When escalating, include: what you ran, the exact error message, the output of `docker compose ps` or `kubectl get pods`, and the relevant log lines.
