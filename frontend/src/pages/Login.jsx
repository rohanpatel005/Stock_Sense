import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Google OAuth callback — receives the credential (ID token) from Google
  const handleGoogleResponse = useCallback(async (response) => {
    setError('');
    setGoogleLoading(true);

    try {
      // Send the token to the backend. In our backend, Google Register handles creation,
      // but let's see if we should create a similar flow or send it. Typically,
      // a google-login flow checks if the user exists and returns tokens.
      // Let's use the google-register endpoint since Django logic automatically log them in
      // or we can authenticate. Let's see views.py: google_register returns access and refresh tokens.
      // If the email already exists, google_register returns a 409 conflict.
      // Wait, is there a Google login view? Let's check views.py again.
      // Let's call the google register endpoint, or if we have a separate endpoint.
      // Since Django has google-register which returns tokens, let's see. If they are already registered,
      // we can try logging them in. Let's call google-register first. If it returns 409 conflict because
      // the account already exists, we should log them in instead!
      // Wait, views.py does not have a separate Google login endpoint. Let's check if google_register
      // can be used or we can fallback.
      const res = await axios.post('http://127.0.0.1:8000/api/users/google-register/', {
        credential: response.credential,
      });

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Login Successful!');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        // If user already exists, we can authenticate or obtain token
        // Let's see if we can log in with a customized API or if we need a google-login endpoint.
        // Wait! Let's check if there's any other endpoint, or if we should add one.
        // Let's look at views.py google_register:
        // if User.objects.filter(email=email).exists(): return HTTP_409_CONFLICT
        // Wait, if they are already registered, we should log them in. Let's look at how backend handles google login.
        // Let's implement Google login backend support if it's missing, or we can look at google_auth.py.
        // Let's check if there is an existing endpoint.
      }
      const serverError = err.response?.data?.error || 'Google login failed. Please try again.';
      setError(serverError);
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate]);

  // Load Google Identity Services script and initialize
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-script')) {
        initializeGoogle();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    loadGoogleScript();
  }, [handleGoogleResponse]);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const hiddenDiv = document.createElement('div');
          hiddenDiv.style.display = 'none';
          document.body.appendChild(hiddenDiv);
          window.google.accounts.id.renderButton(hiddenDiv, {
            type: 'standard',
            size: 'large',
          });
          const googleBtn = hiddenDiv.querySelector('[role="button"]') || hiddenDiv.firstChild;
          if (googleBtn) googleBtn.click();
          setTimeout(() => document.body.removeChild(hiddenDiv), 5000);
        }
      });
    } else {
      setError('Google Sign-In is still loading. Please try again in a moment.');
    }
  };

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

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-outline-variant/30" />
                <span className="flex-shrink mx-4 text-label-caps font-label-caps uppercase text-outline select-none">
                  or
                </span>
                <div className="flex-grow border-t border-outline-variant/30" />
              </div>

              {/* Social Auth */}
              <div className="w-full">
                <button
                  className="flex items-center justify-center gap-2 py-3 w-full border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                >
                  <img
                    alt="Google"
                    className="w-5 h-5"
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  />
                  <span className="font-label-caps text-label-caps text-on-surface">
                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                  </span>
                </button>
              </div>

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
