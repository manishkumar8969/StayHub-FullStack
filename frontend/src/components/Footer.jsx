import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-light border-top mt-5 py-4">
      <div className="container">
        <div className="row gy-4">
          
          {/* Section 1: Brand & About */}
          <div className="col-md-4">
            <h5 className="fw-bold text-danger mb-3">StayHub</h5>
            <p className="text-muted small">
              Duniya bhar mein kahin bhi rehne ke liye sabse behtar aur sasti jagah dhoondhein. 
              Humara maqsad hai har kisi ko ek "Home away from home" dena.
            </p>
            <div className="d-flex gap-3 fs-5 text-dark">
              <a href="#" className="text-dark"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="text-dark"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="text-dark"><i className="fa-brands fa-twitter"></i></a>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="col-md-2 offset-md-1">
            <h6 className="fw-bold mb-3">Support</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Help Center</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">AirCover</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Anti-discrimination</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Disability support</Link></li>
            </ul>
          </div>

          {/* Section 3: Hosting */}
          <div className="col-md-2">
            <h6 className="fw-bold mb-3">Hosting</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><Link to="/new" className="text-decoration-none text-muted">StayHub your home</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">AirCover for Hosts</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Hosting resources</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Community forum</Link></li>
            </ul>
          </div>

          {/* Section 4: StayHub */}
          <div className="col-md-3">
            <h6 className="fw-bold mb-3">StayHub</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Newsroom</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">New features</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Careers</Link></li>
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Investors</Link></li>
            </ul>
          </div>

        </div>

        <hr className="my-4" />

        {/* Bottom Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <div className="mb-2 mb-md-0">
            © 2026 StayHub, Inc. · <a href="#" className="text-muted text-decoration-none mx-1">Privacy</a> · 
            <a href="#" className="text-muted text-decoration-none mx-1">Terms</a> · 
            <a href="#" className="text-muted text-decoration-none mx-1">Sitemap</a>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="fw-bold"><i className="fa-solid fa-globe me-1"></i> English (IN)</span>
            <span className="fw-bold">₹ INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;