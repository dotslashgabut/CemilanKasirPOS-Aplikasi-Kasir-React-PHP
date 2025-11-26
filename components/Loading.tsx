import React from 'react';

export const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Memuat halaman...</p>
        </div>
    );
};
