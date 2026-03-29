import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // States for Review Form
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

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login first!");

        try {
            // Backend Controller ka endpoint: POST /api/listings/:id/reviews
            await axios.post(`http://localhost:5000/api/listings/${id}/reviews`, 
                { rating: Number(rating), comment },
                { headers: { 'Authorization': token } }
            );
            
            alert("Review submitted! ⭐");
            setComment("");
            setRating(5);
            fetchListing(); // Data refresh bina page reload ke
        } catch (err) {
            console.error("Review Error:", err.response?.data);
            alert(err.response?.data?.message || "Review failed! Check console.");
        }
    };

    if (loading) return <div className="text-center mt-5"><h3>Loading...</h3></div>;
    if (!listing) return <div className="text-center mt-5"><h3>Listing not found!</h3></div>;

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <img src={listing.image} className="img-fluid rounded-4 shadow mb-4" style={{width: '100%', height: '400px', objectFit: 'cover'}} alt="stay" />
                    
                    <h1 className="fw-bold">{listing.title}</h1>
                    <p className="text-muted fs-5">{listing.location}, {listing.country}</p>
                    <h4 className="text-danger fw-bold">₹{listing.price} / night</h4>
                    <hr />

                    {/* LEAVE A REVIEW FORM */}
                    {user && (
                        <div className="card p-4 shadow-sm border-0 mb-5 bg-light">
                            <h4 className="fw-bold mb-3">Leave a Review</h4>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="mb-3">
                                    <label className="form-label d-block fw-semibold">Rating (out of 5):</label>
                                    <div className="d-flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <i 
                                                key={star}
                                                className={`fa-star fs-3 ${star <= rating ? 'fa-solid text-warning' : 'fa-regular text-secondary'}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setRating(star)}
                                            ></i>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <textarea 
                                        className="form-control border-0 shadow-sm" 
                                        placeholder="Write your experience..." 
                                        rows="3" 
                                        required
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    ></textarea>
                                </div>
                                <button className="btn btn-dark rounded-pill px-4">Submit</button>
                            </form>
                        </div>
                    )}

                    {/* REVIEWS DISPLAY SECTION */}
                    <div className="mt-5">
                        <h4 className="fw-bold mb-4"><i className="fa-solid fa-star me-2"></i>Reviews</h4>
                        <div className="row">
                            {listing.reviews && listing.reviews.length > 0 ? (
                                listing.reviews.map((rev) => (
                                    <div className="col-md-6 mb-3" key={rev._id}>
                                        <div className="card h-100 p-3 border shadow-sm rounded-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{width:'30px', height:'30px'}}>
                                                    {rev.author?.username?.charAt(0) || 'U'}
                                                </div>
                                                <h6 className="mb-0 fw-bold">{rev.author?.username || 'Guest'}</h6>
                                            </div>
                                            
                                            {/* VISUAL STARS LOGIC: Ise dhyan se copy karein */}
                                            <div className="text-warning mb-2" style={{fontSize: '12px'}}>
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`${i < rev.rating ? 'fa-solid' : 'fa-regular'} fa-star`}></i>
                                                ))}
                                            </div>
                                            
                                            <p className="small text-secondary mb-0">{rev.comment}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted ms-2">No reviews yet. Be the first to review!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;