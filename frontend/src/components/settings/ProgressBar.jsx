import React from 'react';

const ProgressBar = ({ remaining, total }) => {
    let colorClass = 'bg-slate-300';
    let shadowClass = '';
    if (remaining === 3) {
        colorClass = 'bg-[#00E0A4]';
        shadowClass = 'shadow-[0_0_10px_rgba(0,224,164,0.6)]';
    } else if (remaining === 2) {
        colorClass = 'bg-amber-400';
        shadowClass = 'shadow-[0_0_10px_rgba(251,191,36,0.6)]';
    } else if (remaining === 1) {
        colorClass = 'bg-red-500';
        shadowClass = 'shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    }

    const width = `${(remaining / total) * 100}%`;

    return (
        <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden backdrop-blur-sm">
            <div className={`h-full rounded-full transition-all duration-500 ${colorClass} ${shadowClass}`} style={{ width }}></div>
        </div>
    );
};

export default ProgressBar;
