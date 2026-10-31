import { useEffect, useState } from "react";
import api from "../api/client";

// Pulls the useful message out of your backend's error JSON
function getErrorMessage(err) {
  const data = err.response?.data;
  if (data?.fields) return Object.values(data.fields).join(", ");
  if (data?.message) return data.message;
  return err.message;
}

function MenuPage() {
  // ---- categories state ----
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  // ---- menu items state ----
  const [menuItems, setMenuItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [filterId, setFilterId] = useState("");

  const [error, setError] = useState(null);

  // ---- loading ----
  function loadCategories() {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }

  function loadMenuItems() {
    const params = filterId ? { categoryId: filterId } : {};
    api
      .get("/menu-items", { params })
      .then((res) => setMenuItems(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [filterId]);

  // ---- category actions ----
  function handleAdd(e) {
    e.preventDefault();
    if (name.trim() === "") return;

    api
      .post("/categories", { name: name.trim() })
      .then(() => {
        setName("");
        setError(null);
        loadCategories();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  function handleDelete(id) {
    api
      .delete(`/categories/${id}`)
      .then(() => {
        setError(null);
        loadCategories();
        loadMenuItems();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  // ---- menu item actions ----
  function handleAddItem(e) {
    e.preventDefault();
    if (itemName.trim() === "" || price === "" || categoryId === "") return;

    api
      .post(
        "/menu-items",
        {
          name: itemName.trim(),
          description: description.trim(),
          price: Number(price),
        },
        { params: { categoryId } }
      )
      .then(() => {
        setItemName("");
        setDescription("");
        setPrice("");
        setCategoryId("");
        setError(null);
        loadMenuItems();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  function handleDeleteItem(id) {
    api
      .delete(`/menu-items/${id}`)
      .then(() => {
        setError(null);
        loadMenuItems();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <h2>Categories</h2>
      <form onSubmit={handleAdd}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            {c.name}{" "}
            <button onClick={() => handleDelete(c.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Menu Items</h2>
      <form onSubmit={handleAddItem}>
        <input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">-- choose category --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit">Add item</button>
      </form>

      <p>
        Filter:{" "}
        <select value={filterId} onChange={(e) => setFilterId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </p>

      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            {item.name} - Rs. {item.price} ({item.category?.name}){" "}
            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MenuPage;