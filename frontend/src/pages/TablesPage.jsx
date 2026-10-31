import { useEffect, useState } from "react";
import api from "../api/client";

function getErrorMessage(err) {
  const data = err.response?.data;
  if (data?.fields) return Object.values(data.fields).join(", ");
  if (data?.message) return data.message;
  return err.message;
}

function TablesPage() {
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState(null);

  function loadTables() {
    api
      .get("/tables")
      .then((res) => setTables(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(() => {
    loadTables();
  }, []);

  function handleAdd(e) {
    e.preventDefault();
    if (tableNumber === "" || capacity === "") return;

    api
      .post("/tables", {
        tableNumber: Number(tableNumber),
        capacity: Number(capacity),
      })
      .then(() => {
        setTableNumber("");
        setCapacity("");
        setError(null);
        loadTables();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  function handleToggleStatus(table) {
    const newStatus = table.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE";

    api
      .patch(`/tables/${table.id}/status`, null, { params: { status: newStatus } })
      .then(() => {
        setError(null);
        loadTables();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  function handleDelete(id) {
    api
      .delete(`/tables/${id}`)
      .then(() => {
        setError(null);
        loadTables();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <h2>Tables</h2>

      <form onSubmit={handleAdd}>
        <input
          type="number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Table number"
        />
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Capacity (seats)"
        />
        <button type="submit">Add table</button>
      </form>

      <ul>
        {tables.map((t) => (
          <li key={t.id}>
            Table {t.tableNumber} ({t.capacity} seats) -{" "}
            <strong style={{ color: t.status === "AVAILABLE" ? "green" : "orange" }}>
              {t.status}
            </strong>{" "}
            <button onClick={() => handleToggleStatus(t)}>
              {t.status === "AVAILABLE" ? "Mark occupied" : "Mark available"}
            </button>{" "}
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TablesPage;