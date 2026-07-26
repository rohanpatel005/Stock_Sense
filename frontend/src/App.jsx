import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BackgroundShader from './components/Common/BackgroundShader';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
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

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
              <h1 className="text-4xl font-bold">Dashboard</h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
