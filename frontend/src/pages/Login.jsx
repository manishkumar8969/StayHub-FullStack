import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      // LocalStorage mein token aur user info save karna
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert("Welcome back!");
      navigate('/');
      window.location.reload(); // Navbar update karne ke liye
    } catch (err) { alert("Invalid Credentials!"); }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-4 border p-4 shadow rounded bg-white">
        <h3 className="text-center mb-4">Login to StayHub</h3>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" className="form-control mb-3" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="form-control mb-3" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <button className="btn btn-primary w-100 fw-bold">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;