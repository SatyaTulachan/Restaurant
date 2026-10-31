# Sundhara Thakali Chulho — Restaurant Management System

A full-stack restaurant management system built with Java, Spring Boot, React, and MySQL. Manages menu categories, menu items, tables, and orders with full CRUD operations and real-time status tracking.

## Features

- **Category & Menu Management** — create, edit, and organize menu items by category
- **Table Management** — track table availability and capacity, with automatic status updates
- **Order Management** — place orders against a table, track order status through its lifecycle (Pending → Preparing → Served → Paid), with automatic total calculation
- **Automatic table/order sync** — placing an order marks the table occupied; marking an order paid automatically frees the table
- **Validation & error handling** — clean, consistent error responses for invalid input and missing resources
- **RESTful API** — fully documented endpoints (see below) consumed by a React frontend

## Tech Stack

**Backend**
- Java 21, Spring Boot
- Spring Data JPA / Hibernate
- MySQL 8
- Maven
- Lombok

**Frontend**
- React (Vite)
- Axios

## Architecture

The backend follows a standard layered MVC architecture:

```
Controller  →  Service  →  Repository  →  Database
(HTTP layer)  (business logic)  (data access)
```

- **Entities**: `Category`, `MenuItem`, `RestaurantTable`, `Order`, `OrderItem`
- **Relationships**: Category 1–N MenuItem, RestaurantTable 1–N Order, Order 1–N OrderItem, MenuItem 1–N OrderItem
- **Transactions**: Order creation and status updates are wrapped in `@Transactional` methods, ensuring order creation, total calculation, and table status updates all succeed or fail together.

## Getting Started

### Prerequisites
- Java 21+
- Maven
- Node.js + npm
- MySQL 8 (or Docker)

### 1. Database setup

Using Docker:
```bash
docker run --name restaurant-mysql \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=restaurant_db \
  -p 3306:3306 \
  -d mysql:8
```

Or create the database manually on an existing MySQL install:
```sql
CREATE DATABASE restaurant_db;
```

### 2. Backend setup

Configure `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/restaurant_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080
```

Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Reference

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/{id}` | Get one category |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/{id}` | Update a category |
| DELETE | `/api/categories/{id}` | Delete a category |

### Menu Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/menu-items` | List all menu items |
| GET | `/api/menu-items?categoryId={id}` | Filter by category |
| GET | `/api/menu-items/{id}` | Get one menu item |
| POST | `/api/menu-items?categoryId={id}` | Create a menu item |
| PUT | `/api/menu-items/{id}?categoryId={id}` | Update a menu item |
| DELETE | `/api/menu-items/{id}` | Delete a menu item |

### Tables
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tables` | List all tables |
| GET | `/api/tables/{id}` | Get one table |
| POST | `/api/tables` | Create a table |
| PUT | `/api/tables/{id}` | Update table details |
| PATCH | `/api/tables/{id}/status?status=AVAILABLE\|OCCUPIED` | Update table status |
| DELETE | `/api/tables/{id}` | Delete a table |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/{id}` | Get one order |
| POST | `/api/orders` | Place a new order |
| PATCH | `/api/orders/{id}/status?status=PENDING\|PREPARING\|SERVED\|PAID` | Update order status |

**Example — place an order:**
```json
POST /api/orders
{
  "tableId": 1,
  "items": [
    { "menuItemId": 1, "quantity": 2 },
    { "menuItemId": 3, "quantity": 1 }
  ]
}
```

### Error responses
```json
// 404 - resource not found
{ "timestamp": "...", "status": 404, "error": "Not Found", "message": "Category not found: 99" }

// 400 - validation failed
{ "timestamp": "...", "status": 400, "error": "Validation Failed", "fields": { "name": "Category name is required" } }
```

## Screenshots

![img.png](img.png)![img_1.png](img_1.png)
## Run with Docker

cp .env.example .env      # then set DB_PASSWORD
docker compose up --build

Frontend: http://localhost:3000kubectl port-forward svc/frontend 3000:80
API: http://localhost:8080/api

## Run on Kubernetes (minikube)

minikube start --driver=docker
docker build -t restaurant-backend:local .
docker build -t restaurant-frontend:local ./frontend
minikube image load restaurant-backend:local
minikube image load restaurant-frontend:local
kubectl create secret generic db-secret --from-env-file=.env
kubectl apply -f k8s/
kubectl port-forward svc/backend 8080:8080
kubectl port-forward svc/frontend 3000:80
## Future Improvements

- Role-based authentication (staff vs. admin)
- Printable receipts/bills
- Daily sales reports
- 409 Conflict handling for duplicate/linked-record deletions
- 