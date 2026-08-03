import React from 'react';
import { User, Mail } from 'lucide-react';

const ProfileCard = ({ profile }) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Information</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Full Name</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <User className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-800 font-medium">{profile?.name || 'N/A'}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-800 font-medium">{profile?.email || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
