import { CheckCircle2, Check } from 'lucide-react';

const SuccessModal = ({ onContinue }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
            <div className="bg-[#0B1118]/90 backdrop-blur-xl border border-white/10 rounded-[24px] w-full max-w-md shadow-2xl flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 premium-glass-card">
                <div className="p-8 text-center border-b border-white/5 shrink-0 bg-gradient-to-b from-[#00E0A4]/5 to-transparent">
                    <div className="w-16 h-16 bg-[#00E0A4]/10 text-[#00E0A4] border border-[#00E0A4]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,224,164,0.2)]">
                        <CheckCircle2 className="w-8 h-8 drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Account Reset Successfully</h2>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <ul className="space-y-3">
                        {['Portfolio Cleared', 'Transactions Deleted', 'Balance Reset to ₹50,000', 'Remaining Monthly Resets Updated'].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#00E0A4]/10 border border-[#00E0A4]/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,224,164,0.1)]">
                                    <Check className="w-3.5 h-3.5 text-[#00E0A4] drop-shadow-[0_0_2px_rgba(0,224,164,0.5)]" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="p-6 border-t border-white/5 flex shrink-0 bg-[#05070D]/50">
                    <button 
                        onClick={onContinue}
                        className="w-full py-3.5 text-sm font-bold text-[#05070D] bg-gradient-to-r from-[#00E0A4] to-[#00B37E] hover:from-[#00E0A4] hover:to-[#00E0A4] rounded-xl transition-all shadow-[0_0_15px_rgba(0,224,164,0.4)] hover:shadow-[0_0_25px_rgba(0,224,164,0.6)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#00E0A4] focus:ring-offset-2 focus:ring-offset-[#0B1118]"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
