import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // Check karein ki URL 'listings' ke baad sahi hai
                const res = await axios.get('http://localhost:5000/api/listings/user/my-bookings', {
                    headers: { 'Authorization': token }
                });
                console.log("Bookings fetched:", res.data);
                setBookings(res.data);
            } catch (err) {
                console.error("Fetch error:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="text-center mt-5"><h3>Loading your trips...</h3></div>;

    return (
        <div className="container mt-5">
            <h2 className="fw-bold mb-4">My Bookings</h2>
            {bookings.length === 0 ? (
                <div className="alert alert-info">Aapne abhi tak koi booking nahi ki hai.</div>
            ) : (
                <div className="row">
                    {bookings.map((b) => (
                        <div className="col-md-4 mb-4" key={b._id}>
                            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                                <img src={b.listing?.image} className="card-img-top" style={{height:'200px', objectFit:'cover'}} alt="stay" />
                                <div className="card-body">
                                    <h5 className="fw-bold">{b.listing?.title || "Property Deleted"}</h5>
                                    <p className="text-muted mb-1">{b.listing?.location}</p>
                                    <hr />
                                    <div className="small">
                                        <p className="mb-0"><b>Check-In:</b> {new Date(b.checkIn).toLocaleDateString()}</p>
                                        <p className="mb-2"><b>Check-Out:</b> {new Date(b.checkOut).toLocaleDateString()}</p>
                                        <h6 className="fw-bold text-danger">Total: ₹{b.totalPrice}</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;