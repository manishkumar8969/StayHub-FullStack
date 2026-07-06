import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewListing = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "", description: "", price: "", location: "", country: ""
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("location", formData.location);
        data.append("country", formData.country);

        for (let i = 0; i < selectedFiles.length; i++) {
            data.append("images", selectedFiles[i]);
        }

        try {
            // handleSubmit function mein
           await axios.post('/api/listings', data, {
               headers: { 
                   'Authorization': token,
                   'Content-Type': 'multipart/form-data'
          }
        });
            alert("Property Added with Gallery! 🏠");
            navigate('/');
        } catch (err) { 
            console.error(err);
            alert("Failed to add property!"); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5 shadow p-4 rounded-4 bg-white">
            <h2 className="fw-bold mb-4 text-danger">Airbnb your home</h2>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-12">
                    <label className="form-label fw-bold">Title</label>
                    <input type="text" className="form-control" required onChange={e=>setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div className="col-md-12">
                    <label className="form-label fw-bold text-primary">Upload Photos (Select up to 5)</label>
                    <input 
                        type="file" 
                        className="form-control border-primary" 
                        multiple 
                        accept="image/*" 
                        onChange={e => setSelectedFiles(e.target.files)} 
                        required
                    />
                </div>

                <div className="col-md-4"><label className="fw-bold">Price (per night)</label><input type="number" className="form-control" required onChange={e=>setFormData({...formData, price: e.target.value})} /></div>
                <div className="col-md-4"><label className="fw-bold">Location</label><input type="text" className="form-control" required onChange={e=>setFormData({...formData, location: e.target.value})} /></div>
                <div className="col-md-4"><label className="fw-bold">Country</label><input type="text" className="form-control" required onChange={e=>setFormData({...formData, country: e.target.value})} /></div>
                <div className="col-12"><label className="fw-bold">Description</label><textarea className="form-control" rows="3" required onChange={e=>setFormData({...formData, description: e.target.value})}></textarea></div>
                
                <button className="btn btn-danger w-100 mt-4 py-2 fw-bold fs-5" disabled={loading}>
                    {loading ? "Uploading... Please wait" : "Create Stay"}
                </button>
            </form>
        </div>
    );
};

export default NewListing;