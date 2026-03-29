import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchListing = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
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

    // 1. Owner Check Logic
    const isOwner = user && listing && (
        String(user.id || user._id) === String(listing.owner?._id || listing.owner)
    );

    const handleBooking = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login to book!");
        if (!checkIn || !checkOut) return alert("Please select dates!");

        const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
        if (nights <= 0) return alert("Check-out date must be after check-in!");

        try {
            await axios.post(`http://localhost:5000/api/listings/${id}/book`, 
                { checkIn, checkOut, totalPrice: nights * listing.price },
                { headers: { 'Authorization': token } }
            );
            alert("Booking Successful! 🎉");
            navigate('/my-bookings');
        } catch (err) {
            alert("Booking failed!");
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        if (window.confirm("Are you sure you want to delete this stay?")) {
            try {
                await axios.delete(`http://localhost:5000/api/listings/${id}`, {
                    headers: { 'Authorization': token }
                });
                alert("Deleted! ✅");
                navigate('/');
            } catch (err) {
                alert("Delete failed!");
            }
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert("Login first!");
        try {
            await axios.post(`http://localhost:5000/api/listings/${id}/reviews`, 
                { rating: Number(rating), comment },
                { headers: { 'Authorization': token } }
            );
            alert("Review added! ⭐");
            setComment("");
            fetchListing();
        } catch (err) { alert("Review failed!"); }
    };

    if (loading) return <div className="text-center mt-5"><h3>Loading...</h3></div>;
    if (!listing) return <div className="text-center mt-5"><h3>Listing not found!</h3></div>;

    return (
        <div className="container mt-5 mb-5">
            <div className="row">
                <div className="col-md-8">
                    <img src={listing.image} className="img-fluid rounded-4 shadow mb-4" style={{width: '100%', height: '400px', objectFit: 'cover'}} alt="stay" />
                    <h1 className="fw-bold">{listing.title}</h1>
                    <p className="text-muted fs-5">{listing.location}, {listing.country}</p>
                    <hr />
                    <p className="text-secondary" style={{whiteSpace: 'pre-line'}}>{listing.description}</p>
                    
                    {/* 2. EDIT/DELETE BUTTONS (Only for Owner) */}
                    {isOwner && (
                        <div className="mt-4 p-3 border rounded-3 bg-light d-flex gap-3">
                            <button className="btn btn-outline-dark px-4 fw-bold" onClick={() => navigate(`/edit/${id}`)}>Edit Property</button>
                            <button className="btn btn-danger px-4 fw-bold" onClick={handleDelete}>Delete Property</button>
                        </div>
                    )}
                </div>

               {/* RESERVATION CARD */}
<div className="col-md-4">
    {/* Maine yahan style mein zIndex: 10 add kiya hai */}
    <div className="card shadow border-0 p-4 sticky-top" 
         style={{ top: '100px', borderRadius: '15px', zIndex: 10 }}> 
        
        <h4 className="fw-bold">₹{listing.price} <span className="fs-6 fw-normal text-muted">night</span></h4>
        
        <div className="border rounded-3 mt-3">
            <div className="p-2 border-bottom">
                <label className="small fw-bold">CHECK-IN</label>
                <input type="date" className="form-control border-0" onChange={(e)=>setCheckIn(e.target.value)} />
            </div>
            <div className="p-2">
                <label className="small fw-bold">CHECK-OUT</label>
                <input type="date" className="form-control border-0" onChange={(e)=>setCheckOut(e.target.value)} />
            </div>
        </div>

        <button className="btn btn-danger w-100 mt-3 py-2 fw-bold fs-5 rounded-3" onClick={handleBooking}>
            Reserve
        </button>
        <p className="text-center text-muted mt-2 small">You won't be charged yet</p>
    </div>
</div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="row mt-5">
                <div className="col-md-8">
                    <hr />
                    <h4 className="fw-bold mb-4">Reviews</h4>
                    {user && (
                        <form onSubmit={handleReviewSubmit} className="mb-5">
                            <div className="d-flex gap-2 mb-3">
                                {[1,2,3,4,5].map(s => <i key={s} className={`fa-star fs-4 ${s<=rating?'fa-solid text-warning':'fa-regular text-secondary'}`} style={{cursor:'pointer'}} onClick={()=>setRating(s)}></i>)}
                            </div>
                            <textarea className="form-control mb-2 shadow-sm" rows="3" placeholder="Share your experience..." required value={comment} onChange={e=>setComment(e.target.value)}></textarea>
                            <button className="btn btn-dark rounded-pill px-4">Submit Review</button>
                        </form>
                    )}

                    <div className="row">
                        {listing.reviews?.map((rev) => (
                            <div className="col-md-6 mb-3" key={rev._id}>
                                <div className="card p-3 border shadow-sm rounded-3">
                                    <h6 className="fw-bold mb-1">@{rev.author?.username || 'Guest'}</h6>
                                    <div className="text-warning mb-2" style={{fontSize:'12px'}}>
                                        {[...Array(5)].map((_, i) => <i key={i} className={`${i < rev.rating ? 'fa-solid' : 'fa-regular'} fa-star`}></i>)}
                                    </div>
                                    <p className="small text-secondary mb-0">{rev.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;