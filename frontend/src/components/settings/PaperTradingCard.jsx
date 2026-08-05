import ProgressBar from './ProgressBar';

const PaperTradingCard = ({ profile, onResetClick }) => {
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
    const remaining = profile?.remaining_resets ?? 0;
    const isDisabled = remaining === 0;

    return (
        <div className="bg-[#0B1118]/60 backdrop-blur-xl rounded-[24px] p-6 shadow-lg border border-white/10 h-full flex flex-col premium-glass-card">
            <h2 className="text-xl font-bold text-white mb-6">Paper Trading Account</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-[#00E0A4]/10 to-[#00E0A4]/5 rounded-2xl border border-[#00E0A4]/20 shadow-inner">
                    <span className="text-xs font-bold text-[#00E0A4] uppercase tracking-wider drop-shadow-[0_0_2px_rgba(0,224,164,0.5)]">Current Balance</span>
                    <p className="text-2xl font-bold text-white mt-1">{profile?.balance !== undefined ? formatCurrency(profile.balance) : 'N/A'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Limit</span>
                    <p className="text-2xl font-bold text-slate-200 mt-1">3</p>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-400">Remaining Resets</span>
                    <span className="text-[#00E0A4] drop-shadow-[0_0_2px_rgba(0,224,164,0.5)]">{remaining} / 3</span>
                </div>
                <ProgressBar remaining={remaining} total={3} />
            </div>

            <div className="mb-6 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Reset</span>
                <span className="text-slate-200 font-medium">{profile?.last_reset ? new Date(profile.last_reset).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Never'}</span>
            </div>

            <div className="relative group mt-auto">
                <button 
                    onClick={onResetClick}
                    disabled={isDisabled}
                    className={`w-full py-3.5 rounded-[16px] font-bold transition-all ${
                        isDisabled 
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white hover:border-transparent hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5'
                    }`}
                >
                    Reset Paper Trading Account
                </button>
                {isDisabled && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#05070D] border border-white/10 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                        You have already used all 3 monthly resets.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaperTradingCard;
