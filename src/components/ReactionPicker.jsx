import React, { useRef, useEffect } from 'react';

const DEFAULT_EMOJIS = ['😂', '👍', '😍', '😎', '❤️', '😔'];

const ReactionPicker = ({ onSelect, onClose }) => {
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-full mb-2 left-0 glass-card p-2 z-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-1">
                {DEFAULT_EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-white/10"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReactionPicker;
