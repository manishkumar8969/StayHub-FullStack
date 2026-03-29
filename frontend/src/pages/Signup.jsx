import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) { alert("Registration failed! Check if email already exists."); }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-4 border p-4 shadow rounded bg-white">
        <h3 className="text-center mb-4">Join StayHub</h3>
        <form onSubmit={handleSignup}>
          <input type="text" placeholder="Username" className="form-control mb-3" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
          <input type="email" placeholder="Email" className="form-control mb-3" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="form-control mb-3" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <button className="btn btn-danger w-100 fw-bold">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;