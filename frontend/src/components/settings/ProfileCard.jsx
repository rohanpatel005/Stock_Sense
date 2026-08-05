import React from 'react';
import { User, Mail } from 'lucide-react';

const ProfileCard = ({ profile }) => {
    return (
        <div className="bg-[#0B1118]/60 backdrop-blur-xl rounded-[24px] p-6 shadow-lg border border-white/10 premium-glass-card">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                        <User className="w-5 h-5 text-[#00E0A4]" />
                        <span className="text-slate-200 font-medium">{profile?.name || 'N/A'}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                        <Mail className="w-5 h-5 text-[#00E0A4]" />
                        <span className="text-slate-200 font-medium">{profile?.email || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
