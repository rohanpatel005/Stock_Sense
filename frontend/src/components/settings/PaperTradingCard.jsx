import React from 'react';
import ProgressBar from './ProgressBar';

const PaperTradingCard = ({ profile, onResetClick }) => {
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
    const remaining = profile?.remaining_resets ?? 0;
    const isDisabled = remaining === 0;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Paper Trading Account</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Current Balance</span>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{profile?.balance !== undefined ? formatCurrency(profile.balance) : 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Limit</span>
                    <p className="text-2xl font-bold text-slate-800 mt-1">3</p>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-slate-600">Remaining Resets</span>
                    <span className="text-slate-800">{remaining} / 3</span>
                </div>
                <ProgressBar remaining={remaining} total={3} />
            </div>

            <div className="mb-6 flex-1">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Reset</span>
                <span className="text-slate-800 font-medium">{profile?.last_reset ? new Date(profile.last_reset).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Never'}</span>
            </div>

            <div className="relative group mt-auto">
                <button 
                    onClick={onResetClick}
                    disabled={isDisabled}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                        isDisabled 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-500/30'
                    }`}
                >
                    Reset Paper Trading Account
                </button>
                {isDisabled && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        You have already used all 3 monthly resets.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaperTradingCard;
