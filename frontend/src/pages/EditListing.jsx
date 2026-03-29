import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", price: "", location: "", country: "", image: "" });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setFormData(res.data);
      } catch (err) { console.error(err); }
    };
    fetchListing();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/listings/${id}`, formData, {
        headers: { 'Authorization': token }
      });
      alert("Property Updated Successfully! ✨");
      navigate(`/listings/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Update fail ho gaya!");
    }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-8 bg-white p-4 rounded shadow">
        <h3 className="text-center mb-4">Edit Your Property</h3>
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
              <label className="form-label">Price</label>
              <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Image URL</label>
              <input type="text" className="form-control" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
            </div>
          </div>
          <button className="btn btn-danger w-100 fw-bold">Update Stay</button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;