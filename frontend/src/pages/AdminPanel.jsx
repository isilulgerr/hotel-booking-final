// src/pages/AdminPanel.jsx
import React, { useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [form, setForm] = useState({
    hotel_name: "",
    city: "",
    district: "",
    rating: "",
    capacity: "",
    price: "",
    available_from: "",
    available_to: "",
    amenities: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/hotels/add-room", form);
      setResult(res.data);
    } catch (err) {
      console.error("Room creation error:", err);
      setResult({ error: "Something went wrong" });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🏨 Add New Room</h2>
      <form onSubmit={handleSubmit}>
        <input name="hotel_name" placeholder="Hotel Name" value={form.hotel_name} onChange={handleChange} required />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input name="district" placeholder="District" value={form.district} onChange={handleChange} />
        <input name="rating" placeholder="Rating (e.g. 4.5)" type="number" step="0.1" value={form.rating} onChange={handleChange} />
        <input name="capacity" placeholder="Capacity" type="number" value={form.capacity} onChange={handleChange} required />
        <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} required />
        <input name="available_from" placeholder="Available From (YYYY-MM-DD)" value={form.available_from} onChange={handleChange} required />
        <input name="available_to" placeholder="Available To (YYYY-MM-DD)" value={form.available_to} onChange={handleChange} required />
        <input name="amenities" placeholder="Amenities (comma separated)" value={form.amenities} onChange={handleChange} />

        <br /><br />
        <button type="submit">➕ Add Room</button>
      </form>

      {result && (
        <div style={{ marginTop: "1rem" }}>
          {result.room_id ? (
            <p style={{ color: "green" }}>✅ Room added! ID: {result.room_id}</p>
          ) : (
            <p style={{ color: "red" }}>❌ {result.error || "Failed to add room"}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
