import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Mail, Lock, Key, Eye, EyeOff, ArrowRight, TrendingUp, Bot, Briefcase, CheckCircle2, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Step 1: Email
  const [email, setEmail] = useState('');
  
  // Step 2: OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  
  // Step 3: Password Reset
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handlers
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/users/forgot-password/', { email });
      setStep(2);
      setTimer(30);
      setSuccessMessage('OTP sent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
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
      setError('Please enter all 4 digits.');
      setLoading(false);
      return;
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/users/verify-reset-otp/', { email, otp: otpCode });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    // Quick validation check
    const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
    if (!isStrong) {
      setError('Password does not meet the requirements.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/users/reset-password/', {
        email,
        password,
        confirm_password: confirmPassword
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError('');
    try {
      await axios.post('http://127.0.0.1:8000/api/users/forgot-password/', { email });
      setTimer(30);
      setSuccessMessage('OTP resent successfully!');
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  // Password validation checks
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strengthScore = Object.values(checks).filter(Boolean).length;
  const strengthText = strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Medium' : 'Strong';
  const strengthColor = strengthScore <= 2 ? 'bg-red-500' : strengthScore <= 4 ? 'bg-yellow-500' : 'bg-[#00E0A4]';

  return (
    <div className="bg-[#05070D] text-white min-h-screen flex flex-col relative z-10 overflow-x-hidden font-sans">
      <Navbar />

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

        {/* Right Side: Multi-step Form (45%) */}
        <section className="flex-grow md:w-1/2 lg:w-[45%] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
          
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00E0A4]/5 via-[#05070D] to-[#05070D]" />

          <div className="w-full max-w-md relative z-10">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: REQUEST OTP */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#0A0D14]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,224,164,0.05)]"
                >
                  <div className="mb-8">
                    <button 
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Login
                    </button>
                    <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
                    <p className="text-slate-400 text-sm">
                      Enter your registered email address to receive a verification code.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRequestOtp} className="space-y-6">
                    <div className="space-y-2">
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-focus-within:bg-[#00E0A4]/10 transition-colors">
                          <Mail className="text-slate-400 group-focus-within:text-[#00E0A4] transition-colors w-4 h-4" />
                        </div>
                        <input
                          className="w-full bg-[#11141D] border border-transparent rounded-[16px] h-[56px] pl-14 pr-4 text-white text-sm focus:border-[#00E0A4]/50 focus:bg-[#11141D] focus:shadow-[0_0_15px_rgba(0,224,164,0.1)] outline-none transition-all placeholder:text-slate-500"
                          id="email"
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0,224,164,0.4)' }}
                      whileTap={{ y: 0 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-slate-900 font-bold h-[56px] rounded-[16px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {loading ? <span>Sending...</span> : (
                        <>
                          <span>Send OTP</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: VERIFY OTP */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#0A0D14]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,224,164,0.05)]"
                >
                  <div className="mb-8 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#00E0A4]/10 border border-[#00E0A4]/20 text-[#00E0A4] text-xs font-bold tracking-wider mb-4">
                      VERIFICATION
                    </span>
                    <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
                    <p className="text-slate-400 text-sm">
                      Enter the 4-digit code sent to your email: <br />
                      <strong className="text-white mt-1 block">{email}</strong>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="mb-6 p-4 bg-[#00E0A4]/10 text-[#00E0A4] text-sm rounded-xl border border-[#00E0A4]/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00E0A4] flex-shrink-0" />
                      {successMessage}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                      {loading ? <span>Verifying...</span> : <span>Verify OTP</span>}
                    </motion.button>

                    <p className="text-center text-sm text-slate-400 pt-2 flex flex-col gap-2 items-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={timer > 0}
                        className={`${timer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-[#00E0A4] hover:underline cursor-pointer'} font-bold transition-all`}
                      >
                        Resend OTP
                      </button>
                      {timer > 0 && <span className="text-xs">Resend in {timer} seconds</span>}
                    </p>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: RESET PASSWORD */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#0A0D14]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,224,164,0.05)]"
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Create New Password</h2>
                    <p className="text-slate-400 text-sm">
                      Please enter a strong password that you haven't used before.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    {/* New Password */}
                    <div className="space-y-2">
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-focus-within:bg-[#00E0A4]/10 transition-colors">
                          <Lock className="text-slate-400 group-focus-within:text-[#00E0A4] transition-colors w-4 h-4" />
                        </div>
                        <input
                          className="w-full bg-[#11141D] border border-transparent rounded-[16px] h-[56px] pl-14 pr-14 text-white text-sm focus:border-[#00E0A4]/50 focus:bg-[#11141D] focus:shadow-[0_0_15px_rgba(0,224,164,0.1)] outline-none transition-all placeholder:text-slate-500"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="New Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Password Strength</span>
                        <span className={`text-xs font-bold ${password.length === 0 ? 'text-slate-500' : strengthScore <= 2 ? 'text-red-400' : strengthScore <= 4 ? 'text-yellow-400' : 'text-[#00E0A4]'}`}>
                          {password.length === 0 ? 'None' : strengthText}
                        </span>
                      </div>
                      <div className="flex gap-1 mb-4 h-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`flex-1 rounded-full ${i <= strengthScore ? strengthColor : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div className={`flex items-center gap-1 ${checks.length ? 'text-[#00E0A4]' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> 8+ Characters
                        </div>
                        <div className={`flex items-center gap-1 ${checks.upper ? 'text-[#00E0A4]' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Uppercase
                        </div>
                        <div className={`flex items-center gap-1 ${checks.lower ? 'text-[#00E0A4]' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Lowercase
                        </div>
                        <div className={`flex items-center gap-1 ${checks.number ? 'text-[#00E0A4]' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Number
                        </div>
                        <div className={`flex items-center gap-1 ${checks.special ? 'text-[#00E0A4]' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Special Char
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0,224,164,0.4)' }}
                      whileTap={{ y: 0 }}
                      type="submit"
                      disabled={loading || strengthScore < 5}
                      className="w-full bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-slate-900 font-bold h-[56px] rounded-[16px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 transition-all"
                    >
                      {loading ? <span>Resetting...</span> : <span>Reset Password</span>}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#0A0D14]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,224,164,0.05)] text-center flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#00E0A4]/10 border border-[#00E0A4]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,224,164,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-[#00E0A4]" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4">Password Updated Successfully!</h2>
                  
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xs">
                    Your password has been changed successfully. You can now use your new password to log in.
                  </p>

                  <motion.button
                    whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0,224,164,0.4)' }}
                    whileTap={{ y: 0 }}
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-slate-900 font-bold h-[56px] rounded-[16px] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    Go to Login
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
