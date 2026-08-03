import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, CheckCircle2, Info, AlertCircle } from 'lucide-react';

const WarningModal = ({ onCancel, onUnderstand }) => {
    const modalRef = useRef(null);

    // Accessibility: Close on ESC & Focus trap
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        
        // Basic focus trap on mount
        if (modalRef.current) {
            modalRef.current.focus();
        }
        
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <div 
                    ref={modalRef}
                    tabIndex="-1"
                    role="dialog" 
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    className="bg-white rounded-2xl w-full max-w-[750px] shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200 outline-none"
                >
                    {/* Top Section */}
                    <div className="p-8 pb-6 border-b border-red-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-gradient-to-b from-red-50/50 to-white rounded-t-2xl">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-red-200">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="text-center sm:text-left pt-1">
                            <h2 id="modal-title" className="text-2xl font-bold text-slate-800 tracking-tight">Reset Paper Trading Account</h2>
                            <p className="text-slate-600 font-medium mt-2">This action is permanent and cannot be undone.</p>
                        </div>
                    </div>
                    
                    {/* Body Content */}
                    <div className="p-8 space-y-6">
                        {/* Card 1: Deleted Data */}
                        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-red-300 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <div className="flex items-center gap-2 mb-5">
                                <X className="w-5 h-5 text-red-600" />
                                <h3 className="font-bold text-red-900 text-lg">The following data will be deleted</h3>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                {['Portfolio', 'Holdings', 'Transactions', 'Trade History', 'Open Positions', 'Portfolio Analytics', 'AI Insights', 'Profit & Loss History'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                        <X className="w-4 h-4 text-red-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Grid for Safe Data & After Reset */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 2: Safe Data */}
                            <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                <div className="flex items-center gap-2 mb-5">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <h3 className="font-bold text-emerald-900 text-lg">The following will remain safe</h3>
                                </div>
                                <ul className="space-y-4">
                                    {['Account', 'Email', 'Profile', 'Login Credentials'].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Card 3: After Reset */}
                            <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex items-center gap-2 mb-5">
                                    <Info className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-blue-900 text-lg">After Reset</h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        'Paper Trading Balance will reset to ₹50,000', 
                                        'Portfolio will become empty', 
                                        'Monthly Reset Counter increases by 1', 
                                        'Future trades start fresh'
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start shadow-sm mt-2">
                            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Please make sure you really want to continue.</p>
                                <p className="text-sm font-medium text-amber-800 mt-1 leading-relaxed">This operation permanently deletes your paper trading history and cannot be recovered.</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer Buttons */}
                    <div className="p-6 sm:px-8 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row gap-4 justify-end rounded-b-2xl items-center">
                        <button 
                            onClick={onCancel}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onUnderstand}
                            className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;
