import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackgroundShader from './components/Common/BackgroundShader';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import SharePage from './pages/SharePage';
import OrdersPage from './pages/OrdersPage';
import PortfolioPage from './pages/PortfolioPage';
import NewsPage from './pages/NewsPage';
import Layout from './components/Common/Layout';

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

  const handleLoginSuccess = () => {
    // This will be called after successful login/signup
    setUser({ full_name: "StockSense User" }); // Simplified for now
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Main Landing Page Route */}
        <Route
          path="/"
          element={
            <>
              <BackgroundShader />
              <LandingPage />
            </>
          }
        />

        {/* Register Page Route */}
        <Route
          path="/register"
          element={
            <>
              <BackgroundShader />
              <Register />
            </>
          }
        />

        {/* Login Page Route */}
        <Route
          path="/login"
          element={
            <>
              <BackgroundShader />
              <Login />
            </>
          }
        />

        {/* Authenticated Routes wrapped in Layout */}
        <Route element={<Layout user={user} handleLogout={handleLogout} />}>
          <Route path="/dashboard" element={<Dashboard user={user} handleLogout={handleLogout} />} />
          <Route path="/market" element={<Markets user={user} handleLogout={handleLogout} />} />
          <Route path="/market/:symbol" element={<Markets user={user} handleLogout={handleLogout} />} />
          <Route path="/share/:symbol" element={<SharePage user={user} handleLogout={handleLogout} />} />
          <Route path="/orders" element={<OrdersPage user={user} handleLogout={handleLogout} />} />
          <Route path="/portfolio" element={<PortfolioPage user={user} handleLogout={handleLogout} />} />
          <Route path="/news" element={<NewsPage user={user} handleLogout={handleLogout} />} />
        </Route>
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
