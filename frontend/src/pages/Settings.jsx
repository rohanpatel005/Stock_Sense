import { useState, useEffect } from 'react';
import ProfileCard from '../components/settings/ProfileCard';
import PaperTradingCard from '../components/settings/PaperTradingCard';
import WarningModal from '../components/settings/WarningModal';
import OTPModal from '../components/settings/OTPModal';
import SuccessModal from '../components/settings/SuccessModal';
import { useSettings } from '../hooks/useSettings';
import { Settings as SettingsIcon, Loader2 } from 'lucide-react';

const Settings = ({ _user, _handleLogout }) => {
    const { profile, loading, error, fetchProfile, requestOTP, resetAccount } = useSettings();
    
    const [isWarningOpen, setWarningOpen] = useState(false);
    const [isOTPOpen, setOTPOpen] = useState(false);
    const [isSuccessOpen, setSuccessOpen] = useState(false);
    const [isRequestingOTP, setRequestingOTP] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleWarningContinue = async () => {
        setWarningOpen(false);
        setRequestingOTP(true);
        const result = await requestOTP();
        setRequestingOTP(false);
        
        if (result.success) {
            setOTPOpen(true);
        } else {
            alert(result.error || "Failed to send OTP. Please try again.");
        }
    };

    const handleOTPVerify = async (otp) => {
        const result = await resetAccount(otp);
        if (result.success) {
            setOTPOpen(false);
            setSuccessOpen(true);
        }
        return result;
    };

    if (loading) return <div className="p-8 font-semibold text-slate-500">Loading settings...</div>;
    if (error) return <div className="p-8 font-semibold text-red-600">{error}</div>;

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent min-h-screen relative z-10">
            {/* Top Bar */}
            <header className="bg-[#0B1118]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20 hidden lg:block shadow-sm">
                <div className="flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#00E0A4]/20 to-[#00E0A4]/5 border border-[#00E0A4]/20 rounded-xl shadow-[0_0_15px_rgba(0,224,164,0.1)]">
                            <SettingsIcon className="w-5 h-5 text-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
                            <p className="text-xs font-medium text-slate-400">Manage your profile and paper trading account</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 relative">
                <h1 className="text-2xl font-bold text-white lg:hidden mb-4">Settings</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <ProfileCard profile={profile} />
                    <PaperTradingCard profile={profile} onResetClick={() => setWarningOpen(true)} />
                </div>
            </div>

            {isWarningOpen && (
                <WarningModal 
                    onCancel={() => setWarningOpen(false)} 
                    onUnderstand={handleWarningContinue} 
                />
            )}
            {isRequestingOTP && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-[#0B1118]/90 p-8 rounded-2xl border border-white/10 flex flex-col items-center shadow-2xl">
                        <Loader2 className="w-8 h-8 text-[#00E0A4] animate-spin mb-4" />
                        <p className="text-white font-medium">Sending OTP to your email...</p>
                    </div>
                </div>
            )}
            
            {isOTPOpen && (
                <OTPModal 
                    onCancel={() => setOTPOpen(false)} 
                    onVerify={handleOTPVerify} 
                />
            )}
            
            {isSuccessOpen && (
                <SuccessModal 
                    onContinue={() => setSuccessOpen(false)} 
                />
            )}
        </main>
    );
};

export default Settings;
