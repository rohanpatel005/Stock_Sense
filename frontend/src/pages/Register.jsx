import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Sparkles, User, Mail, Lock, Key, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Google OAuth callback — receives the credential (ID token) from Google
  const handleGoogleResponse = useCallback(async (response) => {
    setError('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/users/google-register/', {
        credential: response.credential,
      });

      // Store JWT tokens
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Registration Successful!');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        alert('An account with this email already exists. Please sign in with Google.');
      } else {
        const serverError = err.response?.data?.error || 'Google registration failed. Please try again.';
        setError(serverError);
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate]);

  // Load Google Identity Services script and initialize
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const loadGoogleScript = () => {
      // Don't load if already present
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

  // Handler to trigger Google One Tap / popup sign-in
  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: use the popup flow via renderButton trick
          // Create a hidden container, render Google button, then click it
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
    setSuccessMessage('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/register/', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      setSuccessMessage(response.data.message || 'OTP sent successfully!');
      setShowOtpStep(true);
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError) {
        const errorMsg = Object.entries(serverError)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(errorMsg);
      } else {
        setError('Connection to backend failed. Make sure Django server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      setError('Please enter all 4 digits of the OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/verify-registration-otp/', {
        email: formData.email,
        otp: otpCode,
      });

      setSuccessMessage(response.data.message || 'Verification successful! You can now login.');
      // Reset form on success
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setOtp(['', '', '', '']);
      // Hide OTP screen after 3 seconds
      setTimeout(() => {
        setShowOtpStep(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      const serverError = err.response?.data?.error || 'Verification failed. Please try again.';
      setError(serverError);
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
            
            {/* Bento-style Preview Card */}
            <div className="glass-card rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary-fixed w-5 h-5 fill-primary-fixed/20" />
                  <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-widest">
                    AI Confidence
                  </span>
                </div>
                <span className="font-data-mono text-data-mono text-white">94.2%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary-fixed w-[94.2%] transition-all duration-1000 ease-out" />
              </div>
              <p className="mt-4 font-body-sm text-body-sm text-surface-variant leading-relaxed">
                "Market conditions show high volatility in the semiconductor sector. AI models suggest a defensive posture with focus on cash-rich entities."
              </p>
            </div>
          </div>
        </section>

        {/* Right Side: Registration Form / OTP Verification */}
        <section className="flex-grow md:w-1/2 lg:w-2/5 bg-transparent flex items-center justify-center p-margin-mobile md:p-gutter">
          
          {showOtpStep ? (
            /* OTP Verification Step */
            <div className="w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl border border-white/30 bg-white/85 backdrop-blur-xl">
              <div className="mb-stack-lg text-center">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Verify OTP</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Enter the 4-digit code sent to your email: <br />
                  <strong className="text-primary">{formData.email}</strong>
                </p>
              </div>

              {/* Status Alert Panels */}
              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container text-body-sm rounded-xl border border-error/20">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-4 bg-primary-container text-on-primary-container text-body-sm rounded-xl border border-primary/20">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* 4 Digit Inputs */}
                <div className="flex justify-center gap-4 py-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-14 h-14 text-center text-headline-md font-bold border border-outline-variant rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-headline-md py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <span>Verifying...</span> : <span>Verify Account</span>}
                </button>

                <p className="text-center font-body-md text-body-md text-on-surface-variant">
                  Back to{' '}
                  <button
                    type="button"
                    onClick={() => setShowOtpStep(false)}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Register
                  </button>
                </p>
              </form>
            </div>
          ) : (
            /* Registration Form Step */
            <div className="w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl border border-white/30 bg-white/85 backdrop-blur-xl">
              
              {/* Mobile Branding */}
              <div className="md:hidden flex items-center gap-2 mb-stack-lg justify-center">
                <LineChart className="text-primary w-8 h-8" />
                <h1 className="font-headline-md text-headline-md text-on-background">StockSense</h1>
              </div>

              <div className="mb-stack-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create Account</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Join our precision-led trading ecosystem today.
                </p>
              </div>

              {/* Status Alert Panels */}
              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container text-body-sm rounded-xl border border-error/20">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-4 bg-primary-container text-on-primary-container text-body-sm rounded-xl border border-primary/20">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="fullName">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input
                      className="w-full bg-white border border-outline-variant rounded-lg py-3 pl-12 pr-4 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your legal name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

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
                  <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="password">
                    Password
                  </label>
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                      onClick={togglePassword}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input
                      className="w-full bg-white border border-outline-variant rounded-lg py-3 pl-12 pr-12 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-headline-md py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <span>Submitting...</span> : <span>Register</span>}
                  <ArrowRight className="w-5 h-5" />
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

                <p className="text-center font-body-md text-body-md text-on-surface-variant mt-6">
                  Already have an account?{' '}
                  <a className="text-primary font-bold hover:underline" href="#">
                    Sign in instead
                  </a>
                </p>
              </form>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Register;
