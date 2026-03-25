import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  // 1. Data Fetch karne ka function
  const fetchListings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/listings');
      setListings(res.data);
    } catch (err) {
      console.error("Data load nahi hua:", err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // 2. DELETE Logic: Jo aapne poocha tha
  const handleDelete = async (id) => {
    if (window.confirm("Kya aap is stay ko delete karna chahte hain?")) {
      try {
        await axios.delete(`http://localhost:5000/api/listings/${id}`);
        // UI se turant hatane ke liye filter use karenge
        setListings(listings.filter((item) => item._id !== id));
        alert("Deleted Successfully!");
      } catch (err) {
        alert("Delete karne mein error aaya!");
      }
    }
  };

  return (
    <div className="row mt-4">
      <h2 className="mb-4">Explore Amazing Stays</h2>
      {listings.map((item) => (
        <div className="col-md-4 mb-4" key={item._id}>
          <div className="card h-100 shadow-sm border-0 listing-card">
            {/* Image par click karne se Detail page par jayenge */}
            <img 
              src={item.image} 
              className="card-img-top rounded-3" 
              alt={item.title} 
              style={{ height: "220px", objectFit: "cover", cursor: "pointer" }}
              onClick={() => navigate(`/listings/${item._id}`)} 
            />
            
            <div className="card-body">
              <h5 className="card-title fw-bold">{item.title}</h5>
              <p className="text-muted mb-1">{item.location}, {item.country}</p>
              <p className="card-text"><strong>₹{item.price}</strong> / night</p>
              
              {/* Buttons Section */}
              <div className="d-flex flex-column gap-2 mt-3">
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => navigate(`/listings/${item._id}`)}
                >
                  View Details
                </button>
                
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-dark btn-sm w-50"
                    onClick={() => navigate(`/edit/${item._id}`)}
                  >
                    Edit
                  </button>
                  
                  <button 
                    className="btn btn-outline-danger btn-sm w-50"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;