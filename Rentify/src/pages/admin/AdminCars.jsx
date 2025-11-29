import { useEffect, useState } from "react";
import api from "../../api/axios";
import CarForm from "../../components/CarForm";
import { motion } from "framer-motion";
import { FaCar, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar] = useState(null);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      await api.delete(`/cars/${id}`);
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete car.");
    }
  };

  const handleEdit = (car) => {
    setEditCar(car);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditCar(null);
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto py-12 px-4 sm:px-6"
    >
      <div className="bg-white shadow-md rounded-none border-t-2 border-gray-900 p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCar className="mr-3 text-gray-700" /> Car Management
          </h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition-colors duration-200"
          >
            <FaPlus /> Add New Car
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-gray-50 p-6 border-l-4 border-gray-900">
            <CarFormStyled
              car={editCar}
              onSuccess={() => {
                setShowForm(false);
                fetchCars();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : cars.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 border border-gray-200">
            <FaCar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No cars available in the inventory.</p>
            <button
              onClick={handleAdd}
              className="bg-gray-900 text-white px-6 py-2 inline-block hover:bg-gray-800 transition-colors duration-200"
            >
              Add Your First Car
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map(car => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{car.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {car.imageUrl ? (
                        <img 
                          src={car.imageUrl} 
                          alt={car.model} 
                          className="h-12 w-20 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-20 bg-gray-200 flex items-center justify-center rounded">
                          <FaCar className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{car.pricePerDay?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                        car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {car.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(car)}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Styled version of the CarForm component
const CarFormStyled = ({ car, onSuccess, onCancel }) => {
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
  const [preview, setPreview] = useState(car?.imageUrl || null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      if (files[0]) {
        setForm({ ...form, image: files[0] });
        setPreview(URL.createObjectURL(files[0]));
      }
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
        pricePerDay: parseFloat(form.pricePerDay),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900">{car ? "Edit Car Details" : "Add New Car"}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input 
            name="brand" 
            value={form.brand} 
            onChange={handleChange} 
            required 
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <input 
            name="model" 
            value={form.model} 
            onChange={handleChange} 
            required 
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <input 
            name="type" 
            value={form.type} 
            onChange={handleChange} 
            required 
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day (₹)</label>
          <input 
            name="pricePerDay" 
            type="number" 
            value={form.pricePerDay} 
            onChange={handleChange} 
            required 
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input 
          id="available"
          name="available" 
          type="checkbox" 
          checked={form.available} 
          onChange={handleChange} 
          className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
        />
        <label htmlFor="available" className="ml-2 block text-sm text-gray-700">Available for booking</label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea 
          name="description" 
          value={form.description} 
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <div className="flex items-center space-x-4">
          <div className="relative border border-gray-300 rounded p-2">
            <input 
              name="image" 
              type="file" 
              accept="image/*" 
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="px-4 py-2 bg-gray-100 flex items-center justify-center">
              <span className="text-sm text-gray-600">Choose file...</span>
            </div>
          </div>
          {preview && (
            <div className="h-24 w-24">
              <img src={preview} alt="Preview" className="h-full w-full object-cover rounded" />
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          {loading ? "Saving..." : car ? "Update Car" : "Add Car"}
        </button>
      </div>
    </form>
  );
};

export default AdminCars;