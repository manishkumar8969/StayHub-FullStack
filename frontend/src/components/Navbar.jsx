import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-danger" to="/">StayHub</Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Explore</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-bold text-dark" to="/add">+ Host your stay</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;