import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Home = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [search, setSearch] = useState("");
  const [showTax, setShowTax] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedAmenity, setSelectedAmenity] = useState("All");

  const location = useLocation();

  const fetchListings = async (queryParam = "") => {
    try {
      const finalQuery = queryParam || location.search;
      const res = await axios.get(`/api/listings${finalQuery}`);
      setListings(res.data);
      setFilteredListings(res.data);
    } catch (err) { 
      console.log(err); 
    }
  };

  useEffect(() => { 
    fetchListings(); 
  }, [location.search]);

  // Combined Instant Filtering (Price + Amenities)
  useEffect(() => {
    let result = listings.filter(item => item.price <= maxPrice);

    if (selectedAmenity !== "All") {
      result = result.filter(item => 
        item.amenities && item.amenities.includes(selectedAmenity)
      );
    }

    setFilteredListings(result);
  }, [maxPrice, selectedAmenity, listings]);

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
    <div className="container mt-3 mb-5">
      {/* 🔍 Search Bar & Dynamic Filters Bar */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <form onSubmit={(e) => { e.preventDefault(); fetchListings(`?location=${search}`); }} className="d-flex shadow-sm rounded-pill border p-1 bg-white">
            <input 
              type="text" 
              className="form-control border-0 rounded-pill px-4" 
              placeholder="Search destinations (e.g., Goa, Manali)" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            <button className="btn btn-danger rounded-circle p-2 px-3 ms-2"><i className="fa-solid fa-magnifying-glass"></i></button>
          </form>
        </div>
      </div>

      {/* 🎛️ Filter Panel: Price Slider & Amenities */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">
        <div className="row align-items-center g-3">
          
          {/* Price Range Slider */}
          <div className="col-md-5">
            <label className="form-label fw-bold mb-1 small text-secondary">
              Max Price: <span className="text-danger fw-bold fs-6">₹{Number(maxPrice).toLocaleString()}/night</span>
            </label>
            <input 
              type="range" 
              className="form-range" 
              min="1000" 
              max="50000" 
              step="1000" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)} 
            />
          </div>

          {/* Amenity Filter */}
          <div className="col-md-4">
            <label className="form-label fw-bold mb-1 small text-secondary">Filter by Amenity:</label>
            <select 
              className="form-select rounded-pill border-0 shadow-sm small"
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
            >
              <option value="All">All Amenities 🌟</option>
              <option value="Wifi">📶 High-Speed Wi-Fi</option>
              <option value="Pool">🏊 Swimming Pool</option>
              <option value="AC">❄️ Air Conditioning</option>
              <option value="Kitchen">🍳 Kitchen Available</option>
            </select>
          </div>

          {/* Map / List View Toggle */}
          <div className="col-md-3 text-end">
            <button 
              className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold w-100"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? (
                <> <i className="fa-solid fa-list me-2"></i>Show List View </>
              ) : (
                <> <i className="fa-solid fa-map-location-dot me-2 text-danger"></i>Show Interactive Map </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Categories Bar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="d-flex overflow-auto text-center py-2 no-scrollbar gap-4 flex-grow-1">
          {categories.map((cat, index) => (
            <div key={index} onClick={() => fetchListings(`?category=${cat.name}`)} style={{ opacity: "0.8", cursor: "pointer", minWidth: "80px" }} className="category-icon">
              <i className={`fa-solid ${cat.icon} fs-4 mb-2 text-danger`}></i>
              <p style={{ fontSize: "12px", fontWeight: "600" }}>{cat.name}</p>
            </div>
          ))}
        </div>

        <div className="tax-toggle shadow-sm p-2 rounded-pill bg-white border">
          <div className="form-check form-switch form-check-reverse m-0">
            <label className="form-check-label fw-bold small me-2" htmlFor="flexSwitchCheckDefault">Display total before taxes</label>
            <input className="form-check-input ms-2" type="checkbox" role="switch" id="flexSwitchCheckDefault" onChange={() => setShowTax(!showTax)} />
          </div>
        </div>
      </div>

      {/* 🗺️ INTERACTIVE MAP VIEW */}
      {showMap ? (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5" style={{ height: '550px' }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredListings.map((item) => {
              // Lat/Lng fallback (India center default coordinates if missing)
              const lat = item.geometry?.coordinates[1] || 20.5937 + (Math.random() - 0.5) * 5;
              const lng = item.geometry?.coordinates[0] || 78.9629 + (Math.random() - 0.5) * 5;

              return (
                <Marker key={item._id} position={[lat, lng]}>
                  <Popup>
                    <div style={{ maxWidth: '180px' }}>
                      <img 
                        src={item.images && item.images.length > 0 ? item.images[0] : item.image} 
                        alt={item.title} 
                        className="rounded-3 mb-2"
                        style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                      />
                      <h6 className="fw-bold mb-1 small">{item.title}</h6>
                      <p className="text-danger fw-bold mb-1">₹{item.price}/night</p>
                      <Link to={`/listings/${item._id}`} className="btn btn-sm btn-danger w-100 rounded-pill text-white fw-bold py-1">
                        View Details
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        /* 📋 GRID VIEW */
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredListings.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h5>No stays match your search criteria! 🏨</h5>
              <p className="text-muted">Try adjusting your price slider or search term.</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <div className="col" key={listing._id}>
                <Link to={`/listings/${listing._id}`} className="text-decoration-none text-dark">
                  <div className="card h-100 border-0 shadow-sm hover-card rounded-4 overflow-hidden">
                    <img 
                      src={listing.images && listing.images.length > 0 ? listing.images[0] : listing.image} 
                      className="card-img-top" 
                      alt="stay" 
                      style={{ height: "250px", objectFit: "cover" }} 
                    />
                    <div className="card-body px-2 py-3">
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;