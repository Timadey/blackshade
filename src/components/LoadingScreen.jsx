import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <div className="relative flex items-center justify-center">
                {/* Revolving element */}
                <div className="absolute w-24 h-24 rounded-full border-t-2 border-b-2 border-primary animate-spin-slow opacity-50"></div>
                <div className="absolute w-20 h-20 rounded-full border-r-2 border-l-2 border-purple-500 animate-spin-reverse opacity-50"></div>

                {/* Beating emoji */}
                <div className="text-6xl animate-beat relative z-10">
                    🕶
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
