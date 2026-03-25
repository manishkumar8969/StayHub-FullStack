


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(res.data);
      } catch (err) { console.error("Error fetching detail:", err); }
    };
    fetchDetail();
  }, [id]);

  if (!listing) return <div className="text-center mt-5"><h4>Loading details...</h4></div>;

  return (
    <div className="row mt-4 mb-5">
      <div className="col-md-8 offset-md-2">
        <h2 className="fw-bold mb-3">{listing.title}</h2>
        <div className="card border-0 shadow-sm overflow-hidden rounded-4 mb-4">
          <img 
            src={listing.image || 'https://via.placeholder.com/800x400?text=No+Image+Available'} 
            className="img-fluid" 
            style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} 
            alt={listing.title} 
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4>Hosted in {listing.location}, {listing.country}</h4>
            <p className="text-muted">{listing.description}</p>
          </div>
          <div className="p-4 border rounded shadow-sm bg-light text-center" style={{ minWidth: '200px' }}>
            <h3 className="fw-bold">₹{listing.price}</h3>
            <p className="text-muted">per night</p>
            <button className="btn btn-danger w-100 fw-bold py-2">Reserve Now</button>
          </div>
        </div>
        <hr />
        <button className="btn btn-outline-dark mt-3" onClick={() => navigate('/')}>← Back to Explore</button>
      </div>
    </div>
  );
};

export default ListingDetail;