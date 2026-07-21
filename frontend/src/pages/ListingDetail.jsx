import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(null); 

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const API_BASE_URL = `/api/listings`; 

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchListing = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/${id}`);
            setListing(res.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListing();
    }, [id]);

    const isOwner = user && listing && (
        String(user.id || user._id) === String(listing.owner?._id || listing.owner)
    );

    // ✅ UPDATED: Dynamic Inventory-based Room Booking Logic
    const handleBooking = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login to book!");
        if (!checkIn || !checkOut) return alert("Please select dates!");
        
        const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
        if (nights <= 0) return alert("Check-out date must be after check-in!");

        try {
            const userId = user.id || user._id;
            const totalPrice = nights * listing.price;

            // Updated endpoint calling our new Booking Router
            await axios.post(`/api/bookings/create`, 
                { 
                    hotelId: id,
                    roomId: id, // Mapping listing ID to roomId for seamless compatibility
                    userId: userId,
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    totalPrice: totalPrice,
                    guests: []
                },
                { headers: { 'Authorization': token } }
            );

            alert("Booking Successful! 🎉 Room reserved in inventory.");
            navigate('/my-bookings');
        } catch (err) { 
            const errorMsg = err.response?.data?.message || "Booking failed! Room might be fully booked.";
            alert(errorMsg); 
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        if (window.confirm("Are you sure you want to delete this stay?")) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`, {
                    headers: { 'Authorization': token }
                });
                alert("Deleted! ✅");
                navigate('/');
            } catch (err) { alert("Delete failed!"); }
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert("Login first to leave a review!");
        try {
            await axios.post(`${API_BASE_URL}/${id}/reviews`, 
                { rating: Number(rating), comment },
                { headers: { 'Authorization': token } }
            );
            alert("Review added! ⭐");
            setComment("");
            setRating(5);
            fetchListing(); 
        } catch (err) { alert("Review failed!"); }
    };

    if (loading) return <div className="text-center mt-5"><h3>Loading...</h3></div>;
    if (!listing) return <div className="text-center mt-5"><h3>Listing not found!</h3></div>;

    const galleryImages = listing.images && listing.images.length > 0 ? listing.images : [listing.image];

    return (
        <div className="container mt-5 mb-5">
            <div className="row">
                <div className="col-md-8">
                    {/* PHOTO GALLERY */}
                    <div className="row g-2 mb-4">
                        <div className="col-md-8">
                            <img src={galleryImages[0]} className="img-fluid rounded-start-4 shadow-sm w-100" style={{height: '416px', objectFit: 'cover', cursor: 'zoom-in'}} alt="main" onClick={() => setSelectedImg(galleryImages[0])} />
                        </div>
                        <div className="col-md-4 d-flex flex-column gap-2">
                            {galleryImages.slice(1, 4).map((url, i) => (
                                <img key={i} src={url} className="img-fluid shadow-sm w-100 rounded-end-4" style={{height: '133px', objectFit: 'cover', cursor: 'zoom-in'}} alt="gallery" onClick={() => setSelectedImg(url)} />
                            ))}
                        </div>
                    </div>

                    <h1 className="fw-bold">{listing.title}</h1>
                    <p className="text-muted fs-5">{listing.location}, {listing.country}</p>
                    <hr />
                    <p className="text-secondary" style={{whiteSpace: 'pre-line'}}>{listing.description}</p>
                    
                    {isOwner && (
                        <div className="mt-4 p-3 border rounded-3 bg-light d-flex gap-3">
                            <button className="btn btn-outline-dark px-4 fw-bold" onClick={() => navigate(`/edit/${id}`)}>Edit Property</button>
                            <button className="btn btn-danger px-4 fw-bold" onClick={handleDelete}>Delete Property</button>
                        </div>
                    )}

                    <hr className="my-5" />

                    {/* REVIEWS DISPLAY */}
                    <div className="row mt-4">
                        <h4 className="fw-bold mb-4"><i className="fa-solid fa-star text-danger me-2"></i>Reviews</h4>
                        {listing.reviews && listing.reviews.length > 0 ? (
                            listing.reviews.map((r, i) => (
                                <div key={i} className="col-md-6 mb-3">
                                    <div className="card p-3 border-0 shadow-sm rounded-4 h-100">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width:'35px', height:'35px'}}>
                                                {r.author?.username?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{r.author?.username || "Anonymous"}</h6>
                                                <small className="text-muted">{new Date().toLocaleDateString()}</small>
                                            </div>
                                        </div>
                                        <p className="mb-1 text-warning">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</p>
                                        <p className="text-secondary small mb-0">{r.comment}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted ms-2">No reviews yet. Be the first to leave one!</p>
                        )}
                    </div>

                    {/* CLICKABLE STAR REVIEW FORM */}
                    {user && (
                        <div className="card mt-4 p-4 border-0 shadow-sm rounded-4 bg-light">
                            <h5 className="fw-bold mb-3">Leave a Review</h5>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold d-block">Rating</label>
                                    <div className="fs-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span 
                                                key={star} 
                                                style={{ cursor: 'pointer', color: star <= rating ? '#ff385c' : '#ddd' }}
                                                onClick={() => setRating(star)}
                                            >
                                                {star <= rating ? '★' : '☆'}
                                            </span>
                                        ))}
                                        <span className="ms-2 fs-6 text-muted">({rating} Stars)</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Comment</label>
                                    <textarea className="form-control" rows="3" required value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="How was your stay?"></textarea>
                                </div>
                                <button className="btn btn-dark px-4 rounded-pill fw-bold">Submit Review</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="col-md-4">
                    <div className="card shadow border-0 p-4 sticky-top" style={{ top: '100px', borderRadius: '15px', zIndex: 5 }}> 
                        <h4 className="fw-bold">₹{listing.price} <span className="fs-6 fw-normal text-muted">/night</span></h4>
                        <div className="border rounded-3 mt-3">
                            <div className="p-2 border-bottom"><label className="small fw-bold">CHECK-IN</label><input type="date" className="form-control border-0" onChange={(e)=>setCheckIn(e.target.value)} /></div>
                            <div className="p-2"><label className="small fw-bold">CHECK-OUT</label><input type="date" className="form-control border-0" onChange={(e)=>setCheckOut(e.target.value)} /></div>
                        </div>
                        <button className="btn btn-danger w-100 mt-3 py-2 fw-bold fs-5 rounded-pill" onClick={handleBooking}>Reserve</button>
                    </div>
                </div>
            </div>

            {selectedImg && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 3000}} onClick={() => setSelectedImg(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-transparent border-0">
                            <div className="modal-body p-0 text-center">
                                <img src={selectedImg} className="img-fluid rounded-3" alt="Full View" style={{maxHeight: '90vh'}} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetail;