import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserBookings = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const userId = user.id || user._id;
                // Naya Backend Route call ho raha hai
                const res = await axios.get(`/api/bookings/user/${userId}`, {
                    headers: { 'Authorization': token }
                });
                setBookings(res.data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserBookings();
    }, []);

    if (loading) return <div className="text-center mt-5"><h3>Loading your bookings...</h3></div>;

    if (!user) {
        return (
            <div className="container text-center mt-5">
                <h4>Please login to view your bookings!</h4>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <h2 className="fw-bold mb-4"><i className="fa-solid fa-suitcase text-danger me-2"></i>My Booked Stays</h2>
            
            {bookings.length === 0 ? (
                <div className="card p-5 text-center border-0 shadow-sm rounded-4">
                    <h5>No bookings found yet! 🏨</h5>
                    <p className="text-muted">You haven't booked any stays yet. Explore properties and plan your next trip!</p>
                    <div>
                        <Link to="/" className="btn btn-danger rounded-pill px-4 fw-bold">Explore Stays</Link>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {bookings.map((b) => {
                        const hotel = b.hotelId;
                        if (!hotel) return null;

                        const imageUrl = hotel.images && hotel.images.length > 0 ? hotel.images[0] : hotel.image;

                        return (
                            <div key={b._id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                    <img 
                                        src={imageUrl || "https://via.placeholder.com/400x250"} 
                                        className="card-img-top" 
                                        alt={hotel.title} 
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="badge bg-success rounded-pill px-3 py-1">{b.status}</span>
                                            <small className="text-muted">Booking ID: #{b._id.slice(-6)}</small>
                                        </div>
                                        <h5 className="fw-bold mt-2 mb-1">{hotel.title}</h5>
                                        <p className="text-muted small mb-2"><i className="fa-solid fa-location-dot me-1"></i>{hotel.location}</p>
                                        <hr className="my-2" />
                                        
                                        <div className="d-flex justify-content-between small text-secondary">
                                            <div>
                                                <strong>Check-In:</strong><br />
                                                {new Date(b.checkInDate).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <strong>Check-Out:</strong><br />
                                                {new Date(b.checkOutDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <hr className="my-2" />
                                        
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <span className="small text-muted">Total Paid:</span>
                                            <h5 className="fw-bold text-danger mb-0">₹{b.totalPrice}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBookings;