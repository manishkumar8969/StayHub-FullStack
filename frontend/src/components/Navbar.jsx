import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // LocalStorage se user ki info nikalna
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert("Saara data clear! Logged out successfully. 👋");
    navigate('/login');
    window.location.reload(); // Page reload taaki buttons update ho jayein
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm py-3">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="fa-solid fa-house-chimney text-danger me-2 fs-3"></i>
          <span className="fw-bold fs-3 text-danger" style={{ letterSpacing: '-1px' }}>StayHub</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3 mt-3 mt-lg-0">
            
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/">Explore</Link>
            </li>

            {user ? (
              // AGAR USER LOGIN HAI
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold text-dark" to="/new">Airbnb your home</Link>
                </li>
                <li className="nav-item dropdown">
                  <button className="btn btn-outline-dark rounded-pill px-3 d-flex align-items-center gap-2" id="userMenu" data-bs-toggle="dropdown">
                    <i className="fa-solid fa-bars"></i>
                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px'}}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2 rounded-3">
                    <li><span className="dropdown-item-text fw-bold border-bottom pb-2">Welcome, {user.username}!</span></li>
                    <li><Link className="dropdown-item mt-2 rounded-2" to="/my-listings">My Bookings</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger fw-bold rounded-2" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              // AGAR USER LOGIN NAHI HAI
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-bold text-dark" to="/signup">Sign up</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" to="/login">Log in</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;