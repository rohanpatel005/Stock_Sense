import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LineChart, User, Mail, Lock, Key, Eye, EyeOff, ArrowRight, TrendingUp, Bot, Briefcase } from 'lucide-react';
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
      const serverError = err.response?.data?.error || 'Google registration failed. Please try again.';
      setError(serverError);
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

  const handleOtpKeyDown = (e, _index) => {
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
    <div className="bg-[#05070D] text-white min-h-screen flex flex-col relative z-10 overflow-x-hidden font-sans">
      {/* Navigation Header */}
      <Navbar />

      {/* Auth Split Screen Layout */}
      <main className="flex-grow flex flex-col md:flex-row relative z-10 mt-16 md:mt-0">
        
        {/* Left Side: Premium Hero Section (Visible on Desktop & Tablet) */}
        <section className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden items-center justify-center p-8 lg:p-16 border-r border-white/5">
          {/* Background Decor matching Landing Page */}
          <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#00E0A4]/10 via-[#05070D] to-[#05070D] opacity-80" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00E0A4]/10 rounded-full blur-[120px]" />

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-xl w-full"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E0A4] to-[#00B37E] flex items-center justify-center shadow-[0_0_20px_rgba(0,224,164,0.3)]">
                <LineChart className="text-white w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">StockSense</h1>
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Trade Smarter. <br />
              Invest Confidently. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E0A4] to-[#008f64]">Powered by AI.</span>
            </h2>
            
            <p className="text-lg text-slate-400 mb-12 max-w-md leading-relaxed">
              Access the most advanced AI-powered stock market platform featuring paper trading, real-time analytics, portfolio intelligence, and institutional-grade market research.
            </p>

            <div className="space-y-4 mb-16">
              {[
                { icon: <TrendingUp className="w-5 h-5 text-[#00E0A4]" />, text: "Real-time Market Data" },
                { icon: <Bot className="w-5 h-5 text-[#00E0A4]" />, text: "AI Market Mentor" },
                { icon: <Briefcase className="w-5 h-5 text-[#00E0A4]" />, text: "Risk-Free Paper Trading" }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/5 p-4 rounded-2xl backdrop-blur-sm cursor-default transition-colors hover:bg-white/[0.05]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00E0A4]/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="font-semibold text-slate-200">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Statistics Footer */}
            <div className="flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-2xl font-bold text-white">50,000+</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Active Traders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">System Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#00E0A4]">Live</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">NSE/BSE Data</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Right Side: Registration Form / OTP Verification (45%) */}
        <section className="flex-grow md:w-1/2 lg:w-[45%] flex items-center justify-center p-6 md:p-12 relative">
          
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00E0A4]/5 via-[#05070D] to-[#05070D]" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md relative z-10"
          >
            {showOtpStep ? (
              /* OTP Verification Step */
              <div className="bg-[#0A0D14]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,224,164,0.05)]">
                <div className="mb-8 text-center">
                  <span className="inline-block py-1 px-3 rounded-full bg-[#00E0A4]/10 border border-[#00E0A4]/20 text-[#00E0A4] text-xs font-bold tracking-wider mb-4">
                    VERIFICATION
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
                  <p className="text-slate-400 text-sm">
                    Enter the 4-digit code sent to your email: <br />
                    <strong className="text-white mt-1 block">{formData.email}</strong>
                  </p>
                </div>

                {/* Status Alert Panels */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="mb-6 p-4 bg-[#00E0A4]/10 text-[#00E0A4] text-sm rounded-xl border border-[#00E0A4]/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E0A4]" />
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* 4 Digit Inputs */}
                  <div className="flex justify-center gap-4 py-4">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-14 h-14 text-center text-xl text-white font-bold border border-transparent rounded-xl bg-[#11141D] focus:border-[#00E0A4]/50 focus:shadow-[0_0_15px_rgba(0,224,164,0.15)] outline-none transition-all"
                        required
                      />
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0,224,164,0.4)' }}
                    whileTap={{ y: 0 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-slate-900 font-bold h-[56px] rounded-[16px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 transition-all"
                  >
                    {loading ? <span>Verifying...</span> : <span>Verify Account</span>}
                  </motion.button>

                  <p className="text-center text-sm text-slate-400 pt-2">
                    Back to{' '}
                    <button
                      type="button"
                      onClick={() => setShowOtpStep(false)}
                      className="text-[#00E0A4] font-bold hover:underline transition-all cursor-pointer"
                    >
                      Register
                    </button>
                  </p>
                </form>
              </div>
            ) : (
              /* Registration Form Step */
              <div className="bg-[#0A0D14]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,224,164,0.05)]">
                
                {/* Mobile Branding */}
                <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00E0A4] to-[#00B37E] flex items-center justify-center shadow-[0_0_15px_rgba(0,224,164,0.3)]">
                    <LineChart className="text-white w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">StockSense</h1>
                </div>

                <div className="mb-8">
                  <span className="inline-block py-1 px-3 rounded-full bg-[#00E0A4]/10 border border-[#00E0A4]/20 text-[#00E0A4] text-xs font-bold tracking-wider mb-4">
                    NEW ACCOUNT
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                  <p className="text-slate-400 text-sm">
                    Join our precision-led trading ecosystem today.
                  </p>
                </div>

                {/* Status Alert Panels */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="mb-6 p-4 bg-[#00E0A4]/10 text-[#00E0A4] text-sm rounded-xl border border-[#00E0A4]/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E0A4]" />
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-focus-within:bg-[#00E0A4]/10 transition-colors">
                        <User className="text-slate-400 group-focus-within:text-[#00E0A4] transition-colors w-4 h-4" />
                      </div>
                      <input
                        className="w-full bg-[#11141D] border border-transparent rounded-[16px] h-[56px] pl-14 pr-4 text-white text-sm focus:border-[#00E0A4]/50 focus:bg-[#11141D] focus:shadow-[0_0_15px_rgba(0,224,164,0.1)] outline-none transition-all placeholder:text-slate-500"
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
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-focus-within:bg-[#00E0A4]/10 transition-colors">
                        <Mail className="text-slate-400 group-focus-within:text-[#00E0A4] transition-colors w-4 h-4" />
                      </div>
                      <input
                        className="w-full bg-[#11141D] border border-transparent rounded-[16px] h-[56px] pl-14 pr-4 text-white text-sm focus:border-[#00E0A4]/50 focus:bg-[#11141D] focus:shadow-[0_0_15px_rgba(0,224,164,0.1)] outline-none transition-all placeholder:text-slate-500"
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
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-focus-within:bg-[#00E0A4]/10 transition-colors">
                        <Lock className="text-slate-400 group-focus-within:text-[#00E0A4] transition-colors w-4 h-4" />
                      </div>
                      <input
                        className="w-full bg-[#11141D] border border-transparent rounded-[16px] h-[56px] pl-14 pr-14 text-white text-sm focus:border-[#00E0A4]/50 focus:bg-[#11141D] focus:shadow-[0_0_15px_rgba(0,224,164,0.1)] outline-none transition-all placeholder:text-slate-500"
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        onClick={togglePassword}
                        type="button"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-focus-within:bg-[#00E0A4]/10 transition-colors">
                        <Key className="text-slate-400 group-focus-within:text-[#00E0A4] transition-colors w-4 h-4" />
                      </div>
                      <input
                        className="w-full bg-[#11141D] border border-transparent rounded-[16px] h-[56px] pl-14 pr-14 text-white text-sm focus:border-[#00E0A4]/50 focus:bg-[#11141D] focus:shadow-[0_0_15px_rgba(0,224,164,0.1)] outline-none transition-all placeholder:text-slate-500"
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Register Button */}
                  <motion.button
                    whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0,224,164,0.4)' }}
                    whileTap={{ y: 0 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-slate-900 font-bold h-[56px] rounded-[16px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 transition-all"
                  >
                    {loading ? <span>Submitting...</span> : <span>Register</span>}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  {/* Divider */}
                  <div className="flex items-center my-6 opacity-60">
                    <div className="flex-grow border-t border-slate-700" />
                    <span className="mx-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      OR
                    </span>
                    <div className="flex-grow border-t border-slate-700" />
                  </div>

                  {/* Social Auth */}
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={googleLoading}
                    className="w-full h-[56px] bg-white/5 border border-white/10 rounded-[16px] flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50 group"
                  >
                    <img
                      alt="Google"
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                    />
                    <span className="font-semibold text-slate-200 text-sm">
                      {googleLoading ? 'Connecting...' : 'Continue with Google'}
                    </span>
                  </button>

                  <p className="text-center text-sm text-slate-400 mt-6 pt-2">
                    Already have an account?{' '}
                    <Link className="text-[#00E0A4] font-bold hover:underline transition-all" to="/login">
                      Sign in instead
                    </Link>
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Register;
