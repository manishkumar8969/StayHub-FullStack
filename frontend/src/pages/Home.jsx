import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom'; // useLocation add kiya

const Home = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [showTax, setShowTax] = useState(false);
  const location = useLocation(); // URL track karne ke liye

  // Modified: Ye function ab URL parameters ke saath fetch karega
  const fetchListings = async (queryParam = "") => {
    try {
      // Agar queryParam khali hai, toh URL se check karega
      const finalQuery = queryParam || location.search;
      const res = await axios.get(`/api/listings${queryParam}`);
      setListings(res.data);
    } catch (err) { console.log(err); }
  };

  // Jab bhi URL (location.search) badle, fetchListings chalega
  useEffect(() => { 
    fetchListings(); 
  }, [location.search]);

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

  return (
    <div className="container mt-3">
      {/* Search Bar */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <form onSubmit={(e) => { e.preventDefault(); fetchListings(`?location=${search}`); }} className="d-flex shadow-sm rounded-pill border p-1 bg-white">
            <input type="text" className="form-control border-0 rounded-pill px-4" placeholder="Search destinations" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-danger rounded-circle p-2 px-3 ms-2"><i className="fa-solid fa-magnifying-glass"></i></button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="d-flex overflow-auto text-center py-2 no-scrollbar gap-4 flex-grow-1">
          {categories.map((cat, index) => (
            <div key={index} onClick={() => fetchListings(`?category=${cat.name}`)} style={{ opacity: "0.7", cursor: "pointer", minWidth: "80px" }} className="category-icon">
              <i className={`fa-solid ${cat.icon} fs-4 mb-2`}></i>
              <p style={{ fontSize: "12px", fontWeight: "600" }}>{cat.name}</p>
            </div>
          ))}
        </div>

        <div className="tax-toggle shadow-sm">
          <div className="form-check form-switch form-check-reverse">
            <label className="form-check-label fw-bold small" htmlFor="flexSwitchCheckDefault">Display total before taxes</label>
            <input className="form-check-input ms-3" type="checkbox" role="switch" id="flexSwitchCheckDefault" onChange={() => setShowTax(!showTax)} />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {listings.map((listing) => (
          <div className="col" key={listing._id}>
            <Link to={`/listings/${listing._id}`} className="text-decoration-none text-dark">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <img 
                  src={listing.images && listing.images.length > 0 ? listing.images[0] : listing.image} 
                  className="card-img-top rounded-4" 
                  alt="stay" 
                  style={{ height: "250px", objectFit: "cover" }} 
                />
                <div className="card-body px-1">
                  <h6 className="card-title fw-bold mb-0">{listing.location}, {listing.country}</h6>
                  <p className="text-muted mb-0 small">{listing.title}</p>
                  <p className="fw-bold mt-1 mb-0">
                    ₹{showTax ? (listing.price * 1.18).toLocaleString() : listing.price.toLocaleString()}/night
                    {showTax && <i className="text-secondary fw-normal ms-1" style={{fontSize: '13px'}}> +18% GST</i>}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;