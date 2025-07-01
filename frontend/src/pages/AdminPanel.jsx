import React, { useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  // ➕ Add room state
  const [addForm, setAddForm] = useState({
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

  // ✏️ Update room state
  const [updateForm, setUpdateForm] = useState({
    room_id: "",
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

  const [addResult, setAddResult] = useState(null);
  const [updateResult, setUpdateResult] = useState(null);

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/admin/admin/add-room", addForm, {
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MTM4NTA5OSwianRpIjoiYWNhMTE1MzMtZWZjNC00N2EwLWFhNmMtOTYyODk3MDhhOTVlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzUxMzg1MDk5LCJjc3JmIjoiM2U5MTBlYTktY2RiNC00MmFkLTk2MTgtNzgxNzNhNzM3YzZjIiwiZXhwIjoxNzUxMzg1OTk5fQ.kwhkWiPH6wiZpm_efrk0gACrdSoJKhPYRMoXFPj8Ads" // geçerli JWT
        }
      });

      setAddResult(res.data);
    } catch (err) {
      console.error("Room creation error:", err);
      setAddResult({ error: "Something went wrong" });
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { room_id, ...payload } = updateForm;
      const res = await axios.put(
        `http://localhost:8000/admin/update-room/${room_id}`,
        payload,
        {
          headers: {
            Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MTM4NDQ0OCwianRpIjoiMWVkNmYyYjMtZGIxZi00NWZmLWE5NGMtZGUwNjU4NWNhNTA2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzUxMzg0NDQ4LCJjc3JmIjoiZTQ2ZTM2MWItNWJkYS00MTg3LWI0ZjctMzU2ZmI2YTNhZjUyIiwiZXhwIjoxNzUxMzg1MzQ4fQ.LgYsI3K6sYvrW4yOA6i0CRt8c-qvWO-hDeK2yQnisOQ" // TOKEN!
          }
        }
      );
      setUpdateResult(res.data);
    } catch (err) {
      console.error("Room update error:", err);
      setUpdateResult({ error: "Something went wrong" });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🏨 Add New Room</h2>
      <form onSubmit={handleAddSubmit}>
        <input name="hotel_name" placeholder="Hotel Name" value={addForm.hotel_name} onChange={handleAddChange} required />
        <input name="city" placeholder="City" value={addForm.city} onChange={handleAddChange} required />
        <input name="district" placeholder="District" value={addForm.district} onChange={handleAddChange} />
        <input name="rating" placeholder="Rating" type="number" step="0.1" value={addForm.rating} onChange={handleAddChange} />
        <input name="capacity" placeholder="Capacity" type="number" value={addForm.capacity} onChange={handleAddChange} required />
        <input name="price" placeholder="Price" type="number" value={addForm.price} onChange={handleAddChange} required />
        <input name="available_from" placeholder="Available From (YYYY-MM-DD)" value={addForm.available_from} onChange={handleAddChange} required />
        <input name="available_to" placeholder="Available To (YYYY-MM-DD)" value={addForm.available_to} onChange={handleAddChange} required />
        <input name="amenities" placeholder="Amenities (comma separated)" value={addForm.amenities} onChange={handleAddChange} />
        <br /><br />
        <button type="submit">➕ Add Room</button>
      </form>

      {addResult && (
        <p style={{ color: addResult.room_id ? "green" : "red", marginTop: "1rem" }}>
          {addResult.room ? `✅ Room added! ID: ${addResult.room.id}` : `❌ ${addResult.error || 'Unknown error'}`}

        </p>
      )}

      <hr style={{ margin: "3rem 0" }} />

      <h2>✏️ Update Existing Room</h2>
      <form onSubmit={handleUpdateSubmit}>
        <input name="room_id" placeholder="Room ID (required)" value={updateForm.room_id} onChange={handleUpdateChange} required />
        <input name="hotel_name" placeholder="Hotel Name" value={updateForm.hotel_name} onChange={handleUpdateChange} />
        <input name="city" placeholder="City" value={updateForm.city} onChange={handleUpdateChange} />
        <input name="district" placeholder="District" value={updateForm.district} onChange={handleUpdateChange} />
        <input name="rating" placeholder="Rating" type="number" step="0.1" value={updateForm.rating} onChange={handleUpdateChange} />
        <input name="capacity" placeholder="Capacity" type="number" value={updateForm.capacity} onChange={handleUpdateChange} />
        <input name="price" placeholder="Price" type="number" value={updateForm.price} onChange={handleUpdateChange} />
        <input name="available_from" placeholder="Available From (YYYY-MM-DD)" value={updateForm.available_from} onChange={handleUpdateChange} />
        <input name="available_to" placeholder="Available To (YYYY-MM-DD)" value={updateForm.available_to} onChange={handleUpdateChange} />
        <input name="amenities" placeholder="Amenities (comma separated)" value={updateForm.amenities} onChange={handleUpdateChange} />
        <br /><br />
        <button type="submit">🛠️ Update Room</button>
      </form>

      {updateResult && (
        <p style={{ color: updateResult.room ? "green" : "red", marginTop: "1rem" }}>
          {updateResult.room ? `✅ Room updated! ID: ${updateResult.room.id}` : `❌ ${updateResult.error}`}
        </p>
      )}
    </div>
  );
};

export default AdminPanel;
