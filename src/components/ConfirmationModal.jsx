import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-md p-6 animate-slide-up relative">
                <h3 className={`text-xl font-bold mb-4 ${isDanger ? 'text-red-400' : 'text-white'}`}>
                    {title}
                </h3>

                <div className="text-secondary mb-8 whitespace-pre-line leading-relaxed">
                    {message}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="glass-button hover:bg-white/10"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`glass-button ${isDanger ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white text-black hover:bg-white/90'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
