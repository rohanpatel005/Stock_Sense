import React from 'react';

const ProgressBar = ({ remaining, total }) => {
    let colorClass = 'bg-slate-300';
    if (remaining === 3) colorClass = 'bg-green-500';
    else if (remaining === 2) colorClass = 'bg-orange-500';
    else if (remaining === 1) colorClass = 'bg-red-500';

    const width = `${(remaining / total) * 100}%`;

    return (
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} style={{ width }}></div>
        </div>
    );
};

export default ProgressBar;
