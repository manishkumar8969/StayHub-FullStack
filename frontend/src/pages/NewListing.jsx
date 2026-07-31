import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewListing = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "", 
        description: "", 
        price: "", 
        location: "", 
        country: "",
        category: "Trending"
    });

    // Checkbox se amenities collect karne ke liye state
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Amenities Checkbox Handler
    const handleAmenityChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedAmenities(prev => [...prev, value]);
        } else {
            setSelectedAmenities(prev => prev.filter(item => item !== value));
        }
    };

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
        data.append("category", formData.category);

        // Amenities ko backend bhejna
        selectedAmenities.forEach(amenity => {
            data.append("amenities", amenity);
        });

        for (let i = 0; i < selectedFiles.length; i++) {
            data.append("images", selectedFiles[i]);
        }

        try {
            await axios.post('/api/listings', data, {
                headers: { 
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Property Added Successfully with Amenities! 🏠✨");
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
                    <input type="text" className="form-control" required onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="e.g. Luxury Beach Villa in Goa" />
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

                <div className="col-md-4">
                    <label className="fw-bold">Price (per night in ₹)</label>
                    <input type="number" className="form-control" required onChange={e=>setFormData({...formData, price: e.target.value})} placeholder="e.g. 5000" />
                </div>
                <div className="col-md-4">
                    <label className="fw-bold">Location / City</label>
                    <input type="text" className="form-control" required onChange={e=>setFormData({...formData, location: e.target.value})} placeholder="e.g. Goa" />
                </div>
                <div className="col-md-4">
                    <label className="fw-bold">Country</label>
                    <input type="text" className="form-control" required onChange={e=>setFormData({...formData, country: e.target.value})} placeholder="e.g. India" />
                </div>

                {/* 🏷️ Category Selection Dropdown */}
                <div className="col-md-12">
                    <label className="fw-bold form-label">Category</label>
                    <select 
                        className="form-select fw-medium"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="Trending">🔥 Trending</option>
                        <option value="Rooms">🛏️ Rooms</option>
                        <option value="Iconic Cities">🏙️ Iconic Cities</option>
                        <option value="Mountains">⛰️ Mountains</option>
                        <option value="Castles">🏰 Castles</option>
                        <option value="Amazing Pools">🏊 Amazing Pools</option>
                        <option value="Camping">⛺ Camping</option>
                        <option value="Farms">🌾 Farms</option>
                        <option value="Arctic">❄️ Arctic</option>
                    </select>
                </div>

                {/* 🏊 Amenities Selection Checkboxes */}
                <div className="col-12">
                    <label className="fw-bold form-label">Select Amenities Available:</label>
                    <div className="d-flex flex-wrap gap-4 p-3 border rounded-3 bg-light">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="wifi" id="wifi" onChange={handleAmenityChange} />
                            <label className="form-check-label fw-semibold" htmlFor="wifi">📶 High-Speed Wi-Fi</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="pool" id="pool" onChange={handleAmenityChange} />
                            <label className="form-check-label fw-semibold" htmlFor="pool">🏊 Swimming Pool</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="ac" id="ac" onChange={handleAmenityChange} />
                            <label className="form-check-label fw-semibold" htmlFor="ac">❄️ Air Conditioning</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="kitchen" id="kitchen" onChange={handleAmenityChange} />
                            <label className="form-check-label fw-semibold" htmlFor="kitchen">🍳 Kitchen</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="tv" id="tv" onChange={handleAmenityChange} />
                            <label className="form-check-label fw-semibold" htmlFor="tv">📺 TV / Cable</label>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <label className="fw-bold">Description</label>
                    <textarea className="form-control" rows="3" required onChange={e=>setFormData({...formData, description: e.target.value})} placeholder="Describe your property..."></textarea>
                </div>
                
                <button className="btn btn-danger w-100 mt-4 py-2 fw-bold fs-5 rounded-pill shadow-sm" disabled={loading}>
                    {loading ? "Uploading... Please wait" : "Create Stay"}
                </button>
            </form>
        </div>
    );
};

export default NewListing;