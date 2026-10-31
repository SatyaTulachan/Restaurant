import { useEffect, useState } from "react";
import api from "../api/client";

function getErrorMessage(err) {
  const data = err.response?.data;
  if (data?.fields) return Object.values(data.fields).join(", ");
  if (data?.message) return data.message;
  return err.message;
}

const STATUSES = ["PENDING", "PREPARING", "SERVED", "PAID"];

function OrdersPage() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedTableId, setSelectedTableId] = useState("");
  const [draftItems, setDraftItems] = useState([]); // [{menuItemId, quantity}]
  const [pickItemId, setPickItemId] = useState("");
  const [pickQty, setPickQty] = useState("1");

  const [error, setError] = useState(null);

  function loadTables() {
    api.get("/tables").then((res) => setTables(res.data)).catch((err) => setError(getErrorMessage(err)));
  }
  function loadMenuItems() {
    api.get("/menu-items").then((res) => setMenuItems(res.data)).catch((err) => setError(getErrorMessage(err)));
  }
  function loadOrders() {
    api.get("/orders").then((res) => setOrders(res.data)).catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(() => {
    loadTables();
    loadMenuItems();
    loadOrders();
  }, []);

  // ---- building the draft order (nothing hits the server yet) ----
  function handleAddDraftItem(e) {
    e.preventDefault();
    if (pickItemId === "" || pickQty === "") return;

    setDraftItems((prev) => [
      ...prev,
      { menuItemId: Number(pickItemId), quantity: Number(pickQty) },
    ]);
    setPickItemId("");
    setPickQty("1");
  }

  function handleRemoveDraftItem(index) {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  }

  // ---- submitting the whole order at once ----
  function handlePlaceOrder() {
    if (selectedTableId === "" || draftItems.length === 0) return;

    api
      .post("/orders", {
        tableId: Number(selectedTableId),
        items: draftItems,
      })
      .then(() => {
        setDraftItems([]);
        setSelectedTableId("");
        setError(null);
        loadOrders();
        loadTables(); // table status flips to OCCUPIED, so refresh it too
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  function handleStatusChange(orderId, newStatus) {
    api
      .patch(`/orders/${orderId}/status`, null, { params: { status: newStatus } })
      .then(() => {
        setError(null);
        loadOrders();
        loadTables(); // PAID frees the table, so refresh it too
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  // helper: look up a menu item's name/price for display, since draftItems only stores the id
  function findMenuItem(id) {
    return menuItems.find((m) => m.id === id);
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <h2>Place an order</h2>

      <label>
        Table:{" "}
        <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)}>
          <option value="">-- choose table --</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              Table {t.tableNumber} ({t.status})
            </option>
          ))}
        </select>
      </label>

      <form onSubmit={handleAddDraftItem}>
        <select value={pickItemId} onChange={(e) => setPickItemId(e.target.value)}>
          <option value="">-- choose item --</option>
          {menuItems.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} - Rs. {m.price}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={pickQty}
          onChange={(e) => setPickQty(e.target.value)}
        />
        <button type="submit">Add to order</button>
      </form>

      <ul>
        {draftItems.map((di, index) => {
          const item = findMenuItem(di.menuItemId);
          return (
            <li key={index}>
              {item?.name} x {di.quantity}{" "}
              <button onClick={() => handleRemoveDraftItem(index)}>Remove</button>
            </li>
          );
        })}
      </ul>

      <button onClick={handlePlaceOrder} disabled={selectedTableId === "" || draftItems.length === 0}>
        Place order
      </button>

      <h2>Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            Order #{o.id} — Table {o.table.tableNumber} — Rs. {o.totalAmount}
            <ul>
              {o.items.map((item) => (
                <li key={item.id}>
                  {item.menuItem.name} x {item.quantity} (Rs. {item.unitPrice} each)
                </li>
              ))}
            </ul>
            Status:{" "}
            <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrdersPage;