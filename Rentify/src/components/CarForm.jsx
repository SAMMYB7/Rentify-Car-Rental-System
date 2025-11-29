import { useState } from "react";
import api from "../api/axios";

const CarForm = ({ car, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    brand: car?.brand || "",
    model: car?.model || "",
    type: car?.type || "",
    pricePerDay: car?.pricePerDay || "",
    available: car?.available ?? true,
    description: car?.description || "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("car", new Blob([JSON.stringify({
        brand: form.brand,
        model: form.model,
        type: form.type,
        pricePerDay: form.pricePerDay,
        available: form.available,
        description: form.description,
      })], { type: "application/json" }));
      if (form.image) data.append("image", form.image);

      if (car) {
        await api.put(`/cars/${car.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/cars", data, { headers: { "Content-Type": "multipart/form-data" } });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save car.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
      <h3>{car ? "Edit Car" : "Add New Car"}</h3>
      <div>
        <label>Brand:</label>
        <input name="brand" value={form.brand} onChange={handleChange} required />
      </div>
      <div>
        <label>Model:</label>
        <input name="model" value={form.model} onChange={handleChange} required />
      </div>
      <div>
        <label>Type:</label>
        <input name="type" value={form.type} onChange={handleChange} required />
      </div>
      <div>
        <label>Price Per Day:</label>
        <input name="pricePerDay" type="number" value={form.pricePerDay} onChange={handleChange} required />
      </div>
      <div>
        <label>Available:</label>
        <input name="available" type="checkbox" checked={form.available} onChange={handleChange} />
      </div>
      <div>
        <label>Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} />
      </div>
      <div>
        <label>Image:</label>
        <input name="image" type="file" accept="image/*" onChange={handleChange} />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ marginRight: 8 }}>
        {loading ? "Saving..." : "Save"}
      </button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default CarForm;