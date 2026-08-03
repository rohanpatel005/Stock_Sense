import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/settings/ProfileCard';
import PaperTradingCard from '../components/settings/PaperTradingCard';
import WarningModal from '../components/settings/WarningModal';
import PasswordModal from '../components/settings/PasswordModal';
import SuccessModal from '../components/settings/SuccessModal';
import { useSettings } from '../hooks/useSettings';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = ({ user, handleLogout }) => {
    const { profile, loading, error, fetchProfile, resetAccount } = useSettings();
    
    const [isWarningOpen, setWarningOpen] = useState(false);
    const [isPasswordOpen, setPasswordOpen] = useState(false);
    const [isSuccessOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleWarningContinue = () => {
        setWarningOpen(false);
        setPasswordOpen(true);
    };

    const handlePasswordVerify = async (password) => {
        const result = await resetAccount(password);
        if (result.success) {
            setPasswordOpen(false);
            setSuccessOpen(true);
        }
        return result; // returning so PasswordModal can handle errors
    };

    if (loading) return <div className="p-8 font-semibold text-slate-500">Loading settings...</div>;
    if (error) return <div className="p-8 font-semibold text-red-600">{error}</div>;

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 min-h-screen">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-20 hidden lg:block">
                <div className="flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <SettingsIcon className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
                            <p className="text-xs font-medium text-slate-500">Manage your profile and paper trading account</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-slate-800 lg:hidden mb-4">Settings</h1>
                
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
            
            {isPasswordOpen && (
                <PasswordModal 
                    onCancel={() => setPasswordOpen(false)} 
                    onVerify={handlePasswordVerify} 
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
