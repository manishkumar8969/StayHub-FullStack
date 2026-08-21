import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

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

    const handleCancel = async (bookingId) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        setActionLoading(bookingId);
        try {
            await axios.put(`/api/bookings/cancel/${bookingId}`, {}, {
                headers: { 'Authorization': token }
            });
            // Update state locally
            setBookings(prev => prev.map(b => 
                b._id === bookingId ? { ...b, status: 'Cancelled' } : b
            ));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel booking");
        } finally {
            setActionLoading(null);
        }
    };

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

                        const imageUrl = hotel.images && hotel.images.length > 0 ? hotel.images[0] : (hotel.image?.url || hotel.image);

                        return (
                            <div key={b._id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column justify-content-between">
                                    <div>
                                        <img 
                                            src={imageUrl || "https://via.placeholder.com/400x250"} 
                                            className="card-img-top" 
                                            alt={hotel.title} 
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className={`badge rounded-pill px-3 py-1 ${b.status === 'Cancelled' ? 'bg-secondary' : 'bg-success'}`}>
                                                    {b.status || 'Confirmed'}
                                                </span>
                                                <small className="text-muted">Booking ID: #{b._id.slice(-6)}</small>
                                            </div>
                                            <h5 className="fw-bold mt-2 mb-1 text-truncate">{hotel.title}</h5>
                                            <p className="text-muted small mb-2"><i className="fa-solid fa-location-dot me-1"></i>{hotel.location}</p>
                                            <hr className="my-2" />
                                            
                                            <div className="d-flex justify-content-between small text-secondary">
                                                <div>
                                                    <strong>Check-In:</strong><br />
                                                    {new Date(b.checkInDate || b.checkIn).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <strong>Check-Out:</strong><br />
                                                    {new Date(b.checkOutDate || b.checkOut).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <hr className="my-2" />
                                            
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <span className="small text-muted">Total Paid:</span>
                                                <h5 className="fw-bold text-danger mb-0">₹{b.totalPrice}</h5>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-3 pt-0">
                                        {b.status !== 'Cancelled' ? (
                                            <button 
                                                className="btn btn-outline-danger btn-sm w-100 rounded-pill"
                                                onClick={() => handleCancel(b._id)}
                                                disabled={actionLoading === b._id}
                                            >
                                                {actionLoading === b._id ? (
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                ) : (
                                                    <i className="fa-solid fa-ban me-1"></i>
                                                )}
                                                Cancel Reservation
                                            </button>
                                        ) : (
                                            <div className="text-center text-muted small py-1 bg-light rounded-pill">
                                                Reservation Cancelled
                                            </div>
                                        )}
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