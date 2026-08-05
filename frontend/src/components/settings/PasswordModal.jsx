import React, { useState } from 'react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const PasswordModal = ({ onCancel, onVerify }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) return;

        setLoading(true);
        setError(null);
        
        const result = await onVerify(password);
        if (!result.success) {
            setError(result.error || 'Incorrect password.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
            <div className="bg-[#0B1118]/90 backdrop-blur-xl rounded-[24px] border border-white/10 w-full max-w-md shadow-2xl flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 premium-glass-card">
                <div className="p-6 border-b border-white/5 flex items-center gap-4 shrink-0 bg-gradient-to-b from-[#00E0A4]/5 to-transparent">
                    <div className="w-12 h-12 bg-[#00E0A4]/10 text-[#00E0A4] border border-[#00E0A4]/20 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,224,164,0.15)]">
                        <Lock className="w-6 h-6 drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Confirm Password</h2>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">Enter your account password to continue.</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 bg-[#05070D]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E0A4]/30 focus:border-[#00E0A4]/50 transition-all text-sm font-medium pr-10 text-white placeholder-slate-600 shadow-inner group-hover:border-white/20"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-[#00E0A4] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {error && <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-[#05070D]/50 border-t border-white/5 flex gap-3 justify-end shrink-0">
                        <button 
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!password || loading}
                            className="px-5 py-2.5 text-sm font-bold text-[#05070D] bg-gradient-to-r from-[#00E0A4] to-[#00B37E] hover:from-[#00E0A4] hover:to-[#00E0A4] rounded-xl transition-all shadow-[0_0_15px_rgba(0,224,164,0.4)] hover:shadow-[0_0_25px_rgba(0,224,164,0.6)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#00E0A4] focus:ring-offset-2 focus:ring-offset-[#0B1118]"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#05070D]" />}
                            Verify & Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
