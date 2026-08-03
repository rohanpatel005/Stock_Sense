import React from 'react';
import { CheckCircle2, Check } from 'lucide-react';

const SuccessModal = ({ onContinue }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-8 text-center border-b border-slate-100 shrink-0">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Account Reset Successfully</h2>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <ul className="space-y-3">
                        {['Portfolio Cleared', 'Transactions Deleted', 'Balance Reset to ₹50,000', 'Remaining Monthly Resets Updated'].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex shrink-0">
                    <button 
                        onClick={onContinue}
                        className="w-full py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
