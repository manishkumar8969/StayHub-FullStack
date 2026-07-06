import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // 1. Footer Import kiya
import Home from './pages/Home';
import NewListing from './pages/NewListing';
import ListingDetail from './pages/ListingDetail'; 
import EditListing from './pages/EditListing';     
import Signup from './pages/Signup';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import InfoPage from './pages/InfoPage';

function App() {
  return (
    <Router>
      {/* Navbar hamesha top par rahega */}
      <Navbar /> 

      {/* Main Content Area: minHeight isliye taaki footer hamesha bottom mein rahe */}
      <div className="container mt-5 pt-3" style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Path ko /new kar diya hai kyunki Navbar mein humne /new use kiya hai */}
          <Route path="/new" element={<NewListing />} /> 
          
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/edit/:id" element={<EditListing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          // Pehle upar InfoPage ko import karein
import InfoPage from './pages/InfoPage'; 

// Fir Routes collection ke andar ye block paste kar dein:
<Route path="/help-center" element={<InfoPage />} />
<Route path="/aircover" element={<InfoPage />} />
<Route path="/anti-discrimination" element={<InfoPage />} />
<Route path="/host-home" element={<InfoPage />} />
<Route path="/hosting-resources" element={<InfoPage />} />
<Route path="/community-forum" element={<InfoPage />} />
<Route path="/newsroom" element={<InfoPage />} />
<Route path="/careers" element={<InfoPage />} />
<Route path="/investors" element={<InfoPage />} />
<Route path="/privacy" element={<InfoPage />} />
<Route path="/terms" element={<InfoPage />} />

        </Routes>
      </div>

      {/* Footer hamesha bottom par rahega */}
      <Footer />
    </Router>
  );
}

export default App;