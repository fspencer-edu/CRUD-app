import React, { useEffect, useState } from "react";

const API = "http://localhost:5050/api";

export default function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [itemName, setItemName] = useState("");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [message, setMessage] = useState("");

  const authHeaders = token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    : { "Content-Type": "application/json" };

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token]);

  async function fetchItems() {
    try {
      const res = await fetch(`${API}/items`, {
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) setItems(data);
    } catch (error) {
      setMessage("Failed to fetch items");
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setMessage("");

    const endpoint = mode === "login" ? "login" : "signup";

    const res = await fetch(`${API}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Request failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setCurrentUser(data.user);
    setUsername("");
    setPassword("");
    setMessage("");
  }

  async function handleCreateOrUpdate(e) {
    e.preventDefault();
    if (!itemName.trim()) return;

    const url = editingId ? `${API}/items/${editingId}` : `${API}/items`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({ name: itemName })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Failed");
      return;
    }

    setItemName("");
    setEditingId(null);
    fetchItems();
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/items/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });

    if (res.ok) fetchItems();
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setItemName(item.name);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setCurrentUser(null);
    setItems([]);
    setItemName("");
    setEditingId(null);
    setMessage("");
  }

  if (!token) {
    return (
      <div className="container">
        <h1>CRUD Auth App</h1>
        <form onSubmit={handleAuth} className="card">
          <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">{mode === "login" ? "Login" : "Sign Up"}</button>
          <p className="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
          </p>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <h1>{currentUser?.username}'s Items</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={handleCreateOrUpdate} className="card row">
        <input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Enter item"
          required
        />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      <div className="card">
        {items.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="item">
              <span>{item.name}</span>
              <div className="actions">
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}