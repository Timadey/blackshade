import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

const ShareMessageModal = ({ isOpen, onClose, message, boardTitle }) => {
    const cardRef = useRef(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !message) return null;

    const handleShare = async () => {
        if (!cardRef.current) return;
        setLoading(true);

        try {
            // 1. Generate Image
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2, // High res
                backgroundColor: '#000000', // Ensure black background
            });

            // 2. Prepare Caption
            const shareUrl = `${window.location.origin}/thread/${message.id}`;
            const caption = `Check out this post on Blackshade: ${shareUrl}`;

            // 3. Share or Download
            if (navigator.share) {
                // Convert DataURL to Blob for sharing
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'blackshade-post.png', { type: 'image/png' });

                await navigator.share({
                    title: 'Blackshade Post',
                    text: caption,
                    files: [file],
                    url: shareUrl // Some apps use this, some use text
                });
            } else {
                // Fallback for desktop: Download image and copy link
                const link = document.createElement('a');
                link.download = 'blackshade-post.png';
                link.href = dataUrl;
                link.click();

                await navigator.clipboard.writeText(caption);
                alert('Image downloaded and link copied to clipboard!');
            }

            onClose();
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Failed to generate share image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/50 hover:text-white"
                >
                    Close
                </button>

                {/* Preview Area */}
                <div className="mb-6 overflow-hidden rounded-xl shadow-2xl border border-white/10">
                    {/* The Card to be Captured */}
                    <div
                        ref={cardRef}
                        className="bg-gradient-to-br from-gray-900 to-black p-8 relative overflow-hidden"
                        style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        {/* Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6 text-white/50 text-sm font-medium uppercase tracking-wider">
                                <span className="text-xl">🕶</span>
                                <span>Blackshade</span>
                            </div>

                            <p className="text-2xl font-bold text-white leading-relaxed mb-8 font-serif">
                                "{message.content}"
                            </p>

                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-white/80 font-bold text-sm">
                                            {message.profiles?.pseudonym || 'Anonymous'}
                                        </p>
                                        <p className="text-white/40 text-xs mt-1">
                                            {boardTitle ? `in ${boardTitle}` : 'on Blackshade'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-white/30">
                                            blackshade.site
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <button
                    onClick={handleShare}
                    disabled={loading}
                    className="w-full glass-button bg-white/10 text-white hover:bg-white/20 py-4 font-bold text-lg flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>Generating...</>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Share Image
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ShareMessageModal;
