import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        email: formData.email,
        password: formData.password,
      });

      // Store JWT tokens and user info
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      alert('Login Successful!');
      navigate('/dashboard');
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data;
      if (typeof serverError === 'object' && serverError !== null) {
        const errorMsg = Object.entries(serverError)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(errorMsg);
      } else {
        setError(serverError || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent text-on-surface min-h-screen flex flex-col relative z-10 overflow-x-hidden">
      {/* Navigation Header */}
      <Navbar />

      {/* Auth Split Screen Layout */}
      <main className="flex-grow flex flex-col md:flex-row pt-16">
        
        {/* Left Side: Branding & Visuals (Visible on Desktop) */}
        <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-inverse-surface relative overflow-hidden items-center justify-center p-gutter">
          {/* Background Decor */}
          <div className="absolute inset-0 z-0">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <div className="flex items-center gap-3 mb-stack-lg">
              <LineChart className="text-primary-fixed w-12 h-12" />
              <h1 className="font-headline-lg text-headline-lg text-surface-container-lowest">StockSense</h1>
            </div>
            <h2 className="font-display-lg text-display-lg text-white mb-6 leading-tight">
              Insightful Trading <br />
              <span className="ai-gradient-text">Augmented by AI.</span>
            </h2>
            <p className="font-body-lg text-body-lg text-surface-variant mb-10 max-w-lg">
              Experience a high-performance fintech environment where data clarity meets sophisticated analytical rigor. Join a community of precise traders.
            </p>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="flex-grow md:w-1/2 lg:w-2/5 bg-transparent flex items-center justify-center p-margin-mobile md:p-gutter">
          <div className="w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl border border-white/30 bg-white/85 backdrop-blur-xl">
            
            {/* Mobile Branding */}
            <div className="md:hidden flex items-center gap-2 mb-stack-lg justify-center">
              <LineChart className="text-primary w-8 h-8" />
              <h1 className="font-headline-md text-headline-md text-on-background">StockSense</h1>
            </div>

            <div className="mb-stack-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome Back</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Access your secure dashboard to manage your portfolio.
              </p>
            </div>

            {/* Status Alert Panel */}
            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container text-body-sm rounded-xl border border-error/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input
                    className="w-full bg-white border border-outline-variant rounded-lg py-3 pl-12 pr-4 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="password">
                    Password
                  </label>
                  <a className="font-label-caps text-label-caps text-primary hover:underline" href="#">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input
                    className="w-full bg-white border border-outline-variant rounded-lg py-3 pl-12 pr-12 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-headline-md py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <span>Logging In...</span> : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline cursor-pointer">
                  Get Started
                </Link>
              </p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
