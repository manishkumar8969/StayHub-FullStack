import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewListing = () => {
  const [formData, setFormData] = useState({ title: "", description: "", price: "", location: "", country: "", image: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/listings', formData);
      alert("Property Listed Successfully! 🏠");
      navigate('/'); 
    } catch (err) { alert("Error adding property"); }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 bg-light p-4 rounded shadow-sm">
        <h3 className="text-center mb-4">List Your Property</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input type="text" className="form-control" onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Price per Night</label>
              <input type="number" className="form-control" onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Image URL</label>
              <input type="text" className="form-control" placeholder="https://..." onChange={(e) => setFormData({...formData, image: e.target.value})} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Location</label>
              <input type="text" className="form-control" onChange={(e) => setFormData({...formData, location: e.target.value})} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Country</label>
              <input type="text" className="form-control" onChange={(e) => setFormData({...formData, country: e.target.value})} required />
            </div>
          </div>
          <button className="btn btn-danger w-100 fw-bold py-2">Create Stay</button>
        </form>
      </div>
    </div>
  );
};

export default NewListing;