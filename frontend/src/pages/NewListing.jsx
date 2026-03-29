import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewListing = () => {
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    price: "", 
    location: "", 
    country: "", 
    image: "" 
  });
  
  const navigate = useNavigate();

  // 1. Frontend Protection: Check karein ki user logged in hai ya nahi
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login first to host a stay! 😊");
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // LocalStorage se token nikalna
    const token = localStorage.getItem('token');

    try {
      // 2. Backend ko token ke saath request bhejna (Security ke liye)
      await axios.post('http://localhost:5000/api/listings', formData, {
        headers: {
          'Authorization': token // Backend ka 'protect' middleware ise check karega
        }
      });

      alert("Property Listed Successfully! 🏠");
      navigate('/'); 
    } catch (err) { 
      console.error(err);
      alert(err.response?.data?.message || "Error adding property"); 
    }
  };

  return (
    <div className="row justify-content-center mt-4 mb-5">
      <div className="col-md-8 bg-white p-4 rounded-4 shadow border">
        <h3 className="text-center mb-4 fw-bold">List Your Property</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Title</label>
            <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Cozy Beach Villa"
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Description</label>
            <textarea 
                className="form-control" 
                rows="3"
                placeholder="Tell us about your place..."
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                required
            ></textarea>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Price per Night (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Image URL</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="https://images.unsplash.com/..." 
                onChange={(e) => setFormData({...formData, image: e.target.value})} 
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Location</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Pune"
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Country</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="India"
                onChange={(e) => setFormData({...formData, country: e.target.value})} 
                required 
              />
            </div>
          </div>
          <button className="btn btn-danger w-100 fw-bold py-2 mt-3 fs-5">Create Stay</button>
        </form>
      </div>
    </div>
  );
};

export default NewListing;