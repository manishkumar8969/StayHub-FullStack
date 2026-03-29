import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");

  const categories = [
    { name: "Trending", icon: "fa-fire" },
    { name: "Rooms", icon: "fa-bed" },
    { name: "Iconic Cities", icon: "fa-mountain-city" },
    { name: "Mountains", icon: "fa-mountain" },
    { name: "Castles", icon: "fa-fort-awesome" },
    { name: "Amazing Pools", icon: "fa-person-swimming" },
    { name: "Camping", icon: "fa-campground" },
    { name: "Farms", icon: "fa-wheat-awn" },
    { name: "Arctic", icon: "fa-snowflake" },
  ];

  // Data fetch karne ka function
  const fetchListings = async (queryParam = "") => {
    try {
      const res = await axios.get(`http://localhost:5000/api/listings${queryParam}`);
      setListings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Search handle karne ke liye
  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(`?location=${search}`);
  };

  // Category filter handle karne ke liye
  const handleCategory = (name) => {
    fetchListings(`?category=${name}`);
  };

  return (
    <div className="container mt-3">
      {/* 1. SEARCH BAR SECTION */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <form onSubmit={handleSearch} className="d-flex shadow-sm rounded-pill border p-1 bg-white">
            <input 
              type="text" 
              className="form-control border-0 rounded-pill px-4" 
              placeholder="Search destinations (e.g. Goa, Bihar)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-danger rounded-circle p-2 px-3 ms-2">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>
      </div>

      {/* 2. FILTER ICONS SECTION */}
      <div className="d-flex overflow-auto text-center py-3 no-scrollbar gap-5 mb-4 justify-content-lg-center">
        {categories.map((cat, index) => (
          <div 
            key={index} 
            onClick={() => handleCategory(cat.name)}
            style={{ opacity: "0.7", cursor: "pointer", minWidth: "80px" }} 
            className="category-icon"
          >
            <i className={`fa-solid ${cat.icon} fs-4 mb-2`}></i>
            <p style={{ fontSize: "12px", fontWeight: "600" }}>{cat.name}</p>
          </div>
        ))}
      </div>

      {/* 3. LISTINGS GRID */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {listings.length > 0 ? listings.map((listing) => (
          <div className="col" key={listing._id}>
            <Link to={`/listings/${listing._id}`} className="text-decoration-none text-dark">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <img 
                  src={listing.image} 
                  className="card-img-top rounded-4" 
                  alt={listing.title} 
                  style={{ height: "250px", objectFit: "cover" }} 
                />
                <div className="card-body px-1">
                  <h6 className="card-title fw-bold mb-0">{listing.location}, {listing.country}</h6>
                  <p className="text-muted mb-0" style={{ fontSize: "14px" }}>{listing.title}</p>
                  <p className="fw-bold mt-1 mb-0">₹{listing.price.toLocaleString()} night</p>
                </div>
              </div>
            </Link>
          </div>
        )) : (
            <div className="col-12 text-center mt-5">
                <h4>No stays found for this search! 🏡</h4>
                <button className="btn btn-outline-danger mt-2" onClick={() => fetchListings()}>Show all stays</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;