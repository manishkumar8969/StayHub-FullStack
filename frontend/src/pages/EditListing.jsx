import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "", price: "", location: "", country: "", image: ""
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setFormData(res.data);
      } catch (err) { console.error("Error loading data:", err); }
    };
    fetchListing();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/listings/${id}`, formData);
      alert("Property Updated! ✨");
      navigate('/'); 
    } catch (err) { alert("Update failed!"); }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 bg-white p-4 rounded shadow border">
        <h3 className="text-center mb-4">Edit Your Stay</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input type="text" className="form-control" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Price (₹)</label>
              <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Location</label>
              <input type="text" className="form-control" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Image URL</label>
            <input type="text" className="form-control" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary w-100 fw-bold">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;