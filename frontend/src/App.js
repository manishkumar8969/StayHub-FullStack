import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
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
      {/* Navbar top par rahega */}
      <Navbar /> 

      {/* Main Content Area */}
      <div className="container mt-5 pt-3" style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewListing />} /> 
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/edit/:id" element={<EditListing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          {/* Info & Policy Pages */}
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

      {/* Floating AI Concierge Chatbot Widget */}
      <AIChatbot />

      {/* Footer bottom par rahega */}
      <Footer />
    </Router>
  );
}

export default App;