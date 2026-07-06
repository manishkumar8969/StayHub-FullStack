import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "", description: "", price: "", location: "", country: ""
    });
    const [images, setImages] = useState(["", "", "", ""]); // 4 Photos ka array

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await axios.get(`/api/listings/${id}`);
                setFormData({
                    title: res.data.title,
                    description: res.data.description,
                    price: res.data.price,
                    location: res.data.location,
                    country: res.data.country
                });
                // Agar purani single image hai toh use pehle box mein rakhein
                if (res.data.images && res.data.images.length > 0) {
                    setImages([...res.data.images, "", "", ""].slice(0, 4));
                } else {
                    setImages([res.data.image, "", "", ""]);
                }
            } catch (err) { console.log(err); }
        };
        fetchListing();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const finalImages = images.filter(url => url.trim() !== ""); // Khali box hata dein

        try {
            await axios.put(`/api/listings/${id}`, 
                { ...formData, images: finalImages },
                { headers: { 'Authorization': token } }
            );
            alert("Updated Successfully! ✅");
            navigate(`/listings/${id}`);
        } catch (err) { alert("Update failed!"); }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    return (
        <div className="container mt-5 mb-5 col-md-8">
            <h2 className="fw-bold mb-4 text-danger">Edit Your Property</h2>
            <form onSubmit={handleUpdate} className="row g-3">
                <div className="col-12"><label className="fw-bold">Title</label>
                <input type="text" className="form-control" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} /></div>
                
                {/* 4 Image Inputs for Editing */}
                {images.map((url, i) => (
                    <div className="col-md-6" key={i}>
                        <label className="small fw-bold">Photo URL {i+1} {i===0 && "(Main)"}</label>
                        <input type="text" className="form-control" value={url} onChange={e=>handleImageChange(i, e.target.value)} placeholder="https://..." />
                    </div>
                ))}

                <div className="col-md-4"><label className="fw-bold">Price (₹)</label>
                <input type="number" className="form-control" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} /></div>
                
                <div className="col-md-4"><label className="fw-bold">Location</label>
                <input type="text" className="form-control" value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})} /></div>
                
                <div className="col-md-4"><label className="fw-bold">Country</label>
                <input type="text" className="form-control" value={formData.country} onChange={e=>setFormData({...formData, country:e.target.value})} /></div>

                <div className="col-12"><label className="fw-bold">Description</label>
                <textarea className="form-control" rows="4" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})}></textarea></div>

                <div className="col-12 text-center mt-4">
                    <button className="btn btn-danger px-5 py-2 fw-bold rounded-pill">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default EditListing;