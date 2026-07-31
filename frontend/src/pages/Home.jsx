import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper Component: Recenter Map automatically when markers change
const MapBounds = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [coords, map]);
  return null;
};

const Home = () => {
  const [rawListings, setRawListings] = useState([]);
  const [displayListings, setDisplayListings] = useState([]);
  const [mapCoords, setMapCoords] = useState([]);
  const [search, setSearch] = useState("");
  const [showTax, setShowTax] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedAmenity, setSelectedAmenity] = useState("All");

  const location = useLocation();

  // 1. Fetch Listings from Backend
  const fetchListings = async (queryParam = "") => {
    try {
      const finalQuery = queryParam || location.search;
      const res = await axios.get(`/api/listings${finalQuery}`);
      setRawListings(res.data);
    } catch (err) {
      console.log("Error fetching listings:", err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [location.search]);

  // 2. Combined Client-Side Filtering (Search + Price + Amenity)
  useEffect(() => {
    let result = [...rawListings];

    // Search input filter
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(item => 
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.country && item.country.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q))
      );
    }

    // Price Filter
    result = result.filter(item => item.price <= maxPrice);

    // Amenity Filter (Case-insensitive check across strings or arrays)
    if (selectedAmenity !== "All") {
      result = result.filter(item => {
        if (!item.amenities) return false;
        if (Array.isArray(item.amenities)) {
          return item.amenities.some(a => a.toLowerCase().includes(selectedAmenity.toLowerCase()));
        }
        if (typeof item.amenities === 'string') {
          return item.amenities.toLowerCase().includes(selectedAmenity.toLowerCase());
        }
        return false;
      });
    }

    setDisplayListings(result);
  }, [search, maxPrice, selectedAmenity, rawListings]);

  // 3. Dynamic Real Geocoding for Accurate Leaflet Map Markers
  useEffect(() => {
    if (!showMap || displayListings.length === 0) return;

    const geocodeListings = async () => {
      const coordsArray = [];
      for (const item of displayListings) {
        // Checking if listing already has database coordinates
        if (item.geometry && item.geometry.coordinates && item.geometry.coordinates.length === 2) {
          coordsArray.push({
            id: item._id,
            lat: item.geometry.coordinates[1],
            lng: item.geometry.coordinates[0],
            item
          });
        } else {
          // OpenStreetMap Nominatim Geocoding API for exact city coordinates
          try {
            const query = encodeURIComponent(`${item.location}, ${item.country || ''}`);
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            if (geoRes.data && geoRes.data.length > 0) {
              coordsArray.push({
                id: item._id,
                lat: parseFloat(geoRes.data[0].lat),
                lng: parseFloat(geoRes.data[0].lon),
                item
              });
            }
          } catch (e) {
            console.log("Geocoding failed for item:", item.title);
          }
        }
      }
      setMapCoords(coordsArray);
    };

    geocodeListings();
  }, [showMap, displayListings]);

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
      {/* Search Bar */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <div className="d-flex shadow-sm rounded-pill border p-1 bg-white">
            <input 
              type="text" 
              className="form-control border-0 rounded-pill px-4" 
              placeholder="Search destinations (e.g., Goa, Delhi, Manali)" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            <button className="btn btn-danger rounded-circle p-2 px-3 ms-2">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel: Price Slider, Amenity Filter & Map Toggle */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">
        <div className="row align-items-center g-3">
          
          {/* Price Range Slider (FIXED UI CONTRAST & ALIGNMENT) */}
      <div className="col-md-4">
            <label className="form-label fw-bold mb-2 small text-dark d-flex align-items-center gap-2">
           <span>Max Price / Night:</span>
              <span className="badge bg-danger text-white fw-bold fs-6 shadow-sm px-2 py-1">
              ₹{Number(maxPrice).toLocaleString()}
             </span>
            </label>
          <input 
                     type="range" 
                 className="form-range bg-secondary bg-opacity-25 rounded-pill p-1" 
               style={{ accentColor: "#dc3545", cursor: "pointer", height: "8px" }}
                  min="500" 
                   max="50000" 
                  step="500" 
                  value={maxPrice} 
             onChange={(e) => setMaxPrice(e.target.value)} 
          />
     </div>

          {/* Amenity Filter Dropdown */}
          <div className="col-md-4">
            <label className="form-label fw-bold mb-1 small text-dark">Filter by Amenity:</label>
            <select 
              className="form-select rounded-pill border-0 shadow-sm small fw-semibold text-dark"
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
            >
              <option value="All">All Amenities 🌟</option>
              <option value="wifi">📶 High-Speed Wi-Fi</option>
              <option value="pool">🏊 Swimming Pool</option>
              <option value="ac">❄️ Air Conditioning</option>
              <option value="kitchen">🍳 Kitchen</option>
              <option value="tv">📺 TV / Cable</option>
            </select>
          </div>

          {/* Map / List Toggle Button */}
          <div className="col-md-4 text-end">
            <button 
              className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold w-100"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? (
                <><i className="fa-solid fa-list me-2"></i>Show List View</>
              ) : (
                <><i className="fa-solid fa-map-location-dot me-2 text-danger"></i>Show Interactive Map</>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Categories Bar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="d-flex overflow-auto text-center py-2 no-scrollbar gap-4 flex-grow-1">
          {categories.map((cat, index) => (
            <div 
              key={index} 
              onClick={() => fetchListings(`?category=${cat.name}`)} 
              style={{ opacity: "0.8", cursor: "pointer", minWidth: "80px" }} 
              className="category-icon"
            >
              <i className={`fa-solid ${cat.icon} fs-4 mb-2 text-danger`}></i>
              <p style={{ fontSize: "12px", fontWeight: "600" }}>{cat.name}</p>
            </div>
          ))}
        </div>

        <div className="tax-toggle shadow-sm p-2 rounded-pill bg-white border">
          <div className="form-check form-switch form-check-reverse m-0">
            <label className="form-check-label fw-bold small me-2 text-dark" htmlFor="flexSwitchCheckDefault">Display total before taxes</label>
            <input className="form-check-input ms-2" type="checkbox" role="switch" id="flexSwitchCheckDefault" onChange={() => setShowTax(!showTax)} />
          </div>
        </div>
      </div>

      {/* MAP VIEW vs GRID VIEW */}
      {showMap ? (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5" style={{ height: '550px' }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapCoords.length > 0 && <MapBounds coords={mapCoords} />}
            {mapCoords.map((coord) => (
              <Marker key={coord.id} position={[coord.lat, coord.lng]}>
                <Popup>
                  <div style={{ maxWidth: '180px' }}>
                    <img 
                      src={coord.item.images && coord.item.images.length > 0 ? coord.item.images[0] : coord.item.image} 
                      alt={coord.item.title} 
                      className="rounded-3 mb-2"
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                    <h6 className="fw-bold mb-1 small">{coord.item.title}</h6>
                    <p className="text-muted small mb-1">{coord.item.location}</p>
                    <p className="text-danger fw-bold mb-2">₹{coord.item.price}/night</p>
                    <Link to={`/listings/${coord.item._id}`} className="btn btn-sm btn-danger w-100 rounded-pill text-white fw-bold py-1">
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {displayListings.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h5>No stays match your search/filter criteria! 🏨</h5>
              <p className="text-muted">Try clearing the search or changing the amenity filter.</p>
            </div>
          ) : (
            displayListings.map((listing) => (
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