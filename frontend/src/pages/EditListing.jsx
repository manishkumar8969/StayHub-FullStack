import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: "", 
        description: "", 
        price: "", 
        location: "", 
        country: "",
        category: "Trending"
    });
    
    // 4 Photo URLs state
    const [images, setImages] = useState(["", "", "", ""]); 
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await axios.get(`/api/listings/${id}`);
                const data = res.data;
                
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    price: data.price || "",
                    location: data.location || "",
                    country: data.country || "",
                    category: data.category || "Trending"
                });

                setSelectedAmenities(data.amenities || []);

                // Existing images set karein
                if (data.images && data.images.length > 0) {
                    setImages([...data.images, "", "", ""].slice(0, 4));
                } else if (data.image) {
                    setImages([data.image, "", "", ""]);
                }
            } catch (err) { 
                console.log(err); 
                alert("Failed to fetch property details!");
            }
        };
        fetchListing();
    }, [id]);

    // Handle Image URL Change (Aap URL 1 ko URL 4 mein badal sakte hain)
    const handleImageChange = (index, value) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    // Handle Amenity Checkboxes
    const handleAmenityChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedAmenities(prev => [...prev, value]);
        } else {
            setSelectedAmenities(prev => prev.filter(item => item !== value));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Khali image boxes ko hata dein
        const finalImages = images.filter(url => url && url.trim() !== "");

        // Multi-part Form Data banayein taaki text URL aur Nayi Files dono handle ho sakein
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("location", formData.location);
        data.append("country", formData.country);
        data.append("category", formData.category);

        // Existing image URLs string format mein bhejen
        data.append("existingImages", JSON.stringify(finalImages));

        // Selected amenities bhejen
        selectedAmenities.forEach(amenity => {
            data.append("amenities", amenity);
        });

        // Agar new files select ki hain, toh wo append karein
        for (let i = 0; i < newFiles.length; i++) {
            data.append("images", newFiles[i]);
        }

        try {
            await axios.put(`/api/listings/${id}`, data, { 
                headers: { 
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data'
                } 
            });
            alert("Updated Successfully! ✅");
            navigate(`/listings/${id}`);
        } catch (err) { 
            console.error(err);
            alert("Update failed!"); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5 col-md-8 shadow p-4 rounded-4 bg-white">
            <h2 className="fw-bold mb-4 text-danger">Edit Your Property</h2>
            <form onSubmit={handleUpdate} className="row g-3">
                <div className="col-12">
                    <label className="fw-bold">Title</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={formData.title} 
                        onChange={e => setFormData({ ...formData, title: e.target.value })} 
                        required 
                    />
                </div>
                
                {/* 4 Image URL Inputs with Live Preview */}
                <label className="fw-bold text-dark mb-0">Photo URLs (Edit/Rearrange URLs):</label>
                {images.map((url, i) => (
                    <div className="col-md-6" key={i}>
                        <div className="p-2 border rounded-3 bg-light">
                            <label className="small fw-bold d-flex justify-content-between">
                                <span>Photo URL {i + 1} {i === 0 && "(Main Cover)"}</span>
                                {url && (
                                    <span 
                                        className="text-danger style-pointer" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleImageChange(i, "")}
                                    >
                                        ✕ Clear
                                    </span>
                                )}
                            </label>
                            <input 
                                type="text" 
                                className="form-control form-control-sm my-1" 
                                value={url} 
                                onChange={e => handleImageChange(i, e.target.value)} 
                                placeholder="https://..." 
                            />
                            {url ? (
                                <img 
                                    src={url} 
                                    alt={`Preview ${i + 1}`} 
                                    className="rounded-2 mt-1" 
                                    style={{ width: '100%', height: '70px', objectFit: 'cover' }} 
                                />
                            ) : (
                                <div className="text-center text-muted small py-2 bg-white rounded border">No Image</div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Optional: Upload New Files directly */}
                <div className="col-12">
                    <label className="fw-bold text-primary">Or Upload New Photos from Device (Optional):</label>
                    <input 
                        type="file" 
                        className="form-control border-primary" 
                        multiple 
                        accept="image/*" 
                        onChange={e => setNewFiles(e.target.files)} 
                    />
                </div>

                <div className="col-md-4">
                    <label className="fw-bold">Price (₹)</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        value={formData.price} 
                        onChange={e => setFormData({ ...formData, price: e.target.value })} 
                        required 
                    />
                </div>
                
                <div className="col-md-4">
                    <label className="fw-bold">Location</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={formData.location} 
                        onChange={e => setFormData({ ...formData, location: e.target.value })} 
                        required 
                    />
                </div>
                
                <div className="col-md-4">
                    <label className="fw-bold">Country</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={formData.country} 
                        onChange={e => setFormData({ ...formData, country: e.target.value })} 
                        required 
                    />
                </div>

                {/* Category Selection */}
                <div className="col-md-12">
                    <label className="fw-bold form-label">Category</label>
                    <select 
                        className="form-select fw-medium"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
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

                {/* Amenities Selection */}
                <div className="col-12">
                    <label className="fw-bold form-label">Amenities Available:</label>
                    <div className="d-flex flex-wrap gap-3 p-3 border rounded-3 bg-light">
                        {["wifi", "pool", "ac", "kitchen", "tv"].map(amenity => (
                            <div className="form-check" key={amenity}>
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    value={amenity} 
                                    id={`edit-${amenity}`} 
                                    checked={selectedAmenities.includes(amenity)}
                                    onChange={handleAmenityChange} 
                                />
                                <label className="form-check-label fw-semibold text-capitalize" htmlFor={`edit-${amenity}`}>
                                    {amenity}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-12">
                    <label className="fw-bold">Description</label>
                    <textarea 
                        className="form-control" 
                        rows="4" 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })} 
                        required
                    ></textarea>
                </div>

                <div className="col-12 text-center mt-4">
                    <button className="btn btn-danger px-5 py-2 fw-bold rounded-pill" disabled={loading}>
                        {loading ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditListing;