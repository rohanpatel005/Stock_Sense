import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import SharePage from './pages/SharePage';
import OrdersPage from './pages/OrdersPage';
import PortfolioPage from './pages/PortfolioPage';
import NewsPage from './pages/NewsPage';
import AIMentor from './pages/AIMentor';
import Settings from './pages/Settings';
import Layout from './components/Common/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import WatchlistPage from './pages/WatchlistPage';
import { WatchlistProvider } from './context/WatchlistContext';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("access_token");
    if (token) {
      // In a real app, you might want to fetch user details using the token
      setUser({ full_name: "StockSense User" });
    }
  }, []);

  const _handleLoginSuccess = () => {
    // This will be called after successful login/signup
    setUser({ full_name: "StockSense User" }); // Simplified for now
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <WatchlistProvider>
      <Router>
        <Routes>
        {/* Main Landing Page Route */}
        <Route
          path="/"
          element={
            <>
              <LandingPage />
            </>
          }
        />

        {/* Register Page Route */}
        <Route
          path="/register"
          element={
            <>
              <Register />
            </>
          }
        />

        {/* Login Page Route */}
        <Route
          path="/login"
          element={
            <>
              <Login />
            </>
          }
        />

        {/* Forgot Password Route */}
        <Route
          path="/forgot-password"
          element={
            <>
              <ForgotPassword />
            </>
          }
        />

        {/* Authenticated Routes wrapped in Layout */}
        <Route element={
          <ProtectedRoute>
            <Layout user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard user={user} handleLogout={handleLogout} />} />
          <Route path="/market" element={<Markets user={user} handleLogout={handleLogout} />} />
          <Route path="/market/:symbol" element={<Markets user={user} handleLogout={handleLogout} />} />
          <Route path="/share/:symbol" element={<SharePage user={user} handleLogout={handleLogout} />} />
          <Route path="/orders" element={<OrdersPage user={user} handleLogout={handleLogout} />} />
          <Route path="/portfolio" element={<PortfolioPage user={user} handleLogout={handleLogout} />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/news" element={<NewsPage user={user} handleLogout={handleLogout} />} />
          <Route path="/ai-mentor" element={<AIMentor user={user} handleLogout={handleLogout} />} />
          <Route path="/settings" element={<Settings user={user} handleLogout={handleLogout} />} />
        </Route>
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Router>
    </WatchlistProvider>
  );
}

export default App;
