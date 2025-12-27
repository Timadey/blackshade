import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false, icon = '⚡' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full h-full sm:h-auto sm:max-w-md p-8 sm:p-10 flex flex-col justify-center sm:rounded-[2.5rem] relative animate-slide-up border border-white/5">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 text-4xl shadow-2xl">
                        {icon}
                    </div>
                    <h3 className={`text-3xl font-black tracking-tight mb-4 ${isDanger ? 'text-red-400' : 'text-white'}`}>
                        {title}
                    </h3>
                    <p className="text-secondary text-sm font-medium leading-relaxed px-4">
                        {message}
                    </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-4 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 glass-button bg-white/5 text-gray-400 font-black uppercase tracking-widest text-xs py-4 border-white/5 hover:bg-white/10 active:scale-95 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 glass-button font-black uppercase tracking-widest text-xs py-4 active:scale-95 transition-all shadow-xl ${isDanger
                                ? 'bg-red-500/20 text-red-500 border-red-500/20 hover:bg-red-500/30'
                                : 'bg-white text-white border-none hover:bg-white/90 shadow-white/5'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
