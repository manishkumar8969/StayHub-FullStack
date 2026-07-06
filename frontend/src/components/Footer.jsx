import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-light pt-5 pb-4 border-top mt-5">
            <div className="container">
                <div className="row">
                    {/* StayHub Branding */}
                    <div className="col-md-4 mb-4">
                        <h4 className="fw-bold text-danger">StayHub</h4>
                        <p className="text-muted small">
                            Duniya bhar mein kahin bhi rehne ke liye sabse behtar aur sasti jagah dhoondhein. 
                            Humara maqsad hai har kisi ko ek "Home away from home" dena.
                        </p>
                        <div className="d-flex gap-3 fs-5 mt-3 text-secondary">
                            <i className="fa-brands fa-facebook" style={{cursor: 'pointer'}}></i>
                            <i className="fa-brands fa-instagram" style={{cursor: 'pointer'}}></i>
                            <i className="fa-brands fa-twitter" style={{cursor: 'pointer'}}></i>
                        </div>
                    </div>

                    {/* Support Links */}
                    <div className="col-md-2 mb-4">
                        <h6 className="fw-bold text-dark">Support</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small mt-3">
                            <li><Link to="/help-center" className="text-secondary text-decoration-none hover-link">Help Center</Link></li>
                            <li><Link to="/aircover" className="text-secondary text-decoration-none hover-link">AirCover</Link></li>
                            <li><Link to="/anti-discrimination" className="text-secondary text-decoration-none hover-link">Anti-discrimination</Link></li>
                        </ul>
                    </div>

                    {/* Hosting Links */}
                    <div className="col-md-3 mb-4">
                        <h6 className="fw-bold text-dark">Hosting</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small mt-3">
                            <li><Link to="/host-home" className="text-secondary text-decoration-none hover-link">StayHub your home</Link></li>
                            <li><Link to="/hosting-resources" className="text-secondary text-decoration-none hover-link">Hosting resources</Link></li>
                            <li><Link to="/community-forum" className="text-secondary text-decoration-none hover-link">Community forum</Link></li>
                        </ul>
                    </div>

                    {/* StayHub Company Links */}
                    <div className="col-md-3 mb-4">
                        <h6 className="fw-bold text-dark">StayHub</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small mt-3">
                            <li><Link to="/newsroom" className="text-secondary text-decoration-none hover-link">Newsroom</Link></li>
                            <li><Link to="/careers" className="text-secondary text-decoration-none hover-link">Careers</Link></li>
                            <li><Link to="/investors" className="text-secondary text-decoration-none hover-link">Investors</Link></li>
                        </ul>
                    </div>
                </div>

                <hr className="text-muted" />

                {/* Bottom Row */}
                <div className="d-flex flex-wrap justify-content-between align-items-center small text-muted mt-3">
                    <div>
                        <span>© 2026 StayHub, Inc.</span> · 
                        <Link to="/privacy" className="text-muted text-decoration-none ms-1 me-1">Privacy</Link> · 
                        <Link to="/terms" className="text-muted text-decoration-none ms-1 me-1">Terms</Link> · 
                        <Link to="/sitemap" className="text-muted text-decoration-none ms-1">Sitemap</Link>
                    </div>
                    <div className="d-flex gap-3 align-items-center fw-bold text-dark">
                        <span><i className="fa-solid fa-globe me-1"></i> English (IN)</span>
                        <span>₹ INR</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;