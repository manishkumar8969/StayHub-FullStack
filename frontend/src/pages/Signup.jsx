import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Backend ko request bhej rahe hain
      const res = await axios.post('/api/auth/register', formData);
      
      // 🔥 AUTO-LOGIN LOGIC: 
      // Backend se milne wale token aur user data ko save kar rahe hain
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert(`Welcome to StayHub, ${res.data.user.username}! 🎉 Registration successful.`);
      
      // Seedha Home page par bhej rahe hain (Login page ki zaroorat nahi)
      navigate('/'); 
      
      // Navbar ko refresh karne ke liye page reload
      window.location.reload(); 
      
    } catch (err) { 
      console.error(err);
      alert(err.response?.data?.message || "Registration failed! Check if email already exists."); 
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-4 border p-4 shadow rounded bg-white">
        <h3 className="text-center mb-4 fw-bold text-danger">Join StayHub</h3>
        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Username</label>
            <input 
              type="text" 
              placeholder="Enter username" 
              className="form-control" 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Email</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="form-control" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Password</label>
            <input 
              type="password" 
              placeholder="Create password" 
              className="form-control" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          <button className="btn btn-danger w-100 fw-bold py-2 shadow-sm mt-2">
            Sign Up
          </button>
        </form>
        <p className="text-center mt-3 small text-muted">
          Already have an account? <span className="text-danger border-bottom border-danger" style={{cursor:'pointer'}} onClick={() => navigate('/login')}>Log in</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;