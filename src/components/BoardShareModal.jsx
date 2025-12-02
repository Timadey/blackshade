import React, { useState } from 'react';

const BoardShareModal = ({ isOpen, onClose, board }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !board) return null;

    const boardUrl = `${window.location.origin}/b/${board.slug}`;
    const isPrivate = board.settings?.privacy === 'private';

    const shareMessage = isPrivate
        ? `Send me anonymous messages on Blackshade! 🎭 Only I can see them.`
        : `Send an anonymous message on "${board.title}" - no one will know you sent it. Everyone can see your anonymous message. 🎭`;

    const handleCopy = () => {
        navigator.clipboard.writeText(boardUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform) => {
        const encodedUrl = encodeURIComponent(boardUrl);
        const encodedMessage = encodeURIComponent(shareMessage);

        const urls = {
            whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
        };

        window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-secondary hover:text-primary"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Board Created! 🎉</h3>
                    <p className="text-secondary text-sm">
                        {isPrivate
                            ? "Share this link to receive anonymous messages. Only you can see them!"
                            : "Share this link for everyone to join the conversation!"
                        }
                    </p>
                </div>

                {/* URL Display */}
                <div className="glass-input flex items-center justify-between mb-6 p-3">
                    <span className="text-sm truncate flex-1 mr-2">{boardUrl}</span>
                    <button
                        onClick={handleCopy}
                        className="flex-shrink-0 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors"
                    >
                        {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Privacy Info */}
                <div className={`mb-6 p-3 rounded-lg ${isPrivate ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                    <div className="flex items-start space-x-2">
                        <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isPrivate ? 'text-yellow-400' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isPrivate ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                        <div className="text-xs">
                            <p className={`font-semibold mb-1 ${isPrivate ? 'text-yellow-400' : 'text-green-400'}`}>
                                {isPrivate ? 'Private Board' : 'Public Board'}
                            </p>
                            <p className="text-secondary">
                                {isPrivate
                                    ? "Messages are visible only to you. Senders remain anonymous."
                                    : "All messages are visible to everyone who has the link."
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                    <p className="text-xs text-secondary text-center mb-2">Share on social media</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className="glass-button flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/20"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            WhatsApp
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="glass-button flex items-center justify-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border-[#1DA1F2]/20"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                            Twitter
                        </button>
                        <button
                            onClick={() => handleShare('facebook')}
                            className="glass-button flex items-center justify-center gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/20"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                        <button
                            onClick={() => handleShare('telegram')}
                            className="glass-button flex items-center justify-center gap-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border-[#0088cc]/20"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            Telegram
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 glass-button bg-white text-black hover:bg-white/90"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default BoardShareModal;
