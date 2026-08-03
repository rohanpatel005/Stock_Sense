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
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4 shrink-0">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Confirm Password</h2>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">Enter your account password to continue.</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium pr-10"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end shrink-0">
                        <button 
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!password || loading}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Verify & Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
