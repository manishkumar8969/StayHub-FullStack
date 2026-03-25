import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewListing from './pages/NewListing';
import ListingDetail from './pages/ListingDetail'; 
import EditListing from './pages/EditListing';     

function App() {
  return (
    <Router>
      <Navbar /> 
      <div className="container mt-5 pt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<NewListing />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/edit/:id" element={<EditListing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;