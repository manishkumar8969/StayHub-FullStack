import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Check agar login user Host hai
  const isHost = user && user.role === 'host';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert("Logged out successfully. 👋");
    navigate('/login');
    window.location.reload();
  };

  // Function: Explore click par filters clear karne ke liye
  const handleExploreClick = () => {
    window.location.href = "/"; 
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm py-3" style={{ zIndex: 1050 }}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={handleExploreClick}>
          <i className="fa-solid fa-house-chimney text-danger me-2 fs-3"></i>
          <span className="fw-bold fs-3 text-danger" style={{ letterSpacing: '-1px' }}>StayHub</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3 mt-3 mt-lg-0">
            
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/" onClick={handleExploreClick}>Explore</Link>
            </li>

            {user ? (
              <>
                {/* 🎯 SIRF HOSTS KE LIYE: "Airbnb your home" link dikhega */}
                {isHost && (
                  <li className="nav-item">
                    <Link className="nav-link fw-semibold text-danger border border-danger-subtle rounded-pill px-3 bg-danger-subtle" to="/new">
                      + Airbnb your home
                    </Link>
                  </li>
                )}

                <li className="nav-item dropdown">
                  <button className="btn btn-outline-dark rounded-pill px-3 d-flex align-items-center gap-2" id="userMenu" data-bs-toggle="dropdown">
                    <i className="fa-solid fa-bars"></i>
                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px'}}>
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2 rounded-3">
                    <li>
                      <span className="dropdown-item-text fw-bold border-bottom mb-2 text-danger d-flex justify-content-between align-items-center">
                        <span>Hi, {user.username}</span>
                        <small className="badge bg-dark rounded-pill text-uppercase" style={{fontSize: '10px'}}>
                          {user.role || 'Guest'}
                        </small>
                      </span>
                    </li>

                    {/* Dropdown mein bhi Add Stay link sirf Host ko dikhega */}
                    {isHost && (
                      <li>
                        <Link className="dropdown-item rounded-2 fw-medium text-danger" to="/new">
                          <i className="fa-solid fa-plus me-2"></i>Add New Stay
                        </Link>
                      </li>
                    )}

                    <li>
                      <Link className="dropdown-item mt-1 rounded-2" to="/my-bookings">
                        <i className="fa-solid fa-suitcase me-2"></i>My Bookings
                      </Link>
                    </li>

                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger fw-bold rounded-2" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link fw-bold text-dark" to="/signup">Sign up</Link></li>
                <li className="nav-item"><Link className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" to="/login">Log in</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;