import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReplyButton = ({ messageId, replyCount = 0 }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.stopPropagation();
        navigate(`/thread/${messageId}`);
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-1 text-secondary hover:text-primary transition-colors group"
        >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="text-xs font-medium">
                {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}` : 'Reply'}
            </span>
        </button>
    );
};

export default ReplyButton;
