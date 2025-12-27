import React, { useRef, useState, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { generatePseudonym, getRandomBackground } from '../lib/PseudoGenerator';

const ShareMessageModal = ({ isOpen, onClose, message, boardTitle }) => {
    const cardRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const stickerBg = useMemo(() => getRandomBackground(message?.id), [message?.id]);
    const pseudonym = useMemo(() => message?.profiles?.pseudonym || generatePseudonym(message?.id), [message?.id, message?.profiles?.pseudonym]);

    if (!isOpen || !message) return null;

    const handleShare = async () => {
        if (!cardRef.current) return;
        setLoading(true);

        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 3, // Even higher res for stickers
                backgroundColor: 'transparent', // Good for stickers
            });

            const shareUrl = `${window.location.origin}/thread/${message.id}`;
            const caption = `Anonymous message on Blackshade: ${shareUrl}`;

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'blackshade.png', { type: 'image/png' });

                await navigator.share({
                    title: 'Blackshade',
                    text: caption,
                    files: [file],
                });
            } else {
                const link = document.createElement('a');
                link.download = 'blackshade.png';
                link.href = dataUrl;
                link.click();
                await navigator.clipboard.writeText(caption);
                alert('Sticker saved and link copied!');
            }
            onClose();
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Failed to share sticker.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm relative">
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/50 hover:text-white bg-white/10 rounded-full p-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Sticker Preview */}
                <div className="mb-8 flex justify-center">
                    <div
                        ref={cardRef}
                        className={`${stickerBg} w-[340px] min-h-[340px] rounded-[50px] p-10 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden`}
                    >
                        {/* Glass Overlay for depth */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

                        {/* Decorative Circles */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl shadow-inner flex items-center justify-center">
                                    <span className="text-xl">🕶️</span>
                                </div>
                                <span className="text-white font-black tracking-tighter text-xl uppercase">blackshade</span>
                            </div>

                            <p className={`font-black text-white leading-[1.2] drop-shadow-2xl transition-all break-words ${message.content.length > 100 ? 'text-xl' :
                                message.content.length > 50 ? 'text-2xl' :
                                    'text-4xl'
                                }`}>
                                {message.content}
                            </p>
                        </div>

                        <div className="relative z-10 flex justify-between items-end mt-8">
                            <div>
                                <p className="text-white font-black text-[10px] bg-black/30 backdrop-blur-md px-2 py-1 rounded-2xl inline-block border border-white/10 uppercase tracking-widest shadow-lg">
                                    @{pseudonym.split(' ').join('_').toLowerCase()}
                                </p>
                            </div>
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] py-1">
                                blackshade.site
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleShare}
                        disabled={loading}
                        className="w-full bg-white text-gray-400 hover:bg-white/90 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {loading ? 'Designing...' : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share to Story
                            </>
                        )}
                    </button>
                    <p className="text-center text-white/40 text-xs">
                        Download sticker and share on Instagram/TikTok
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareMessageModal;
