import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CreatePostModal from '../components/CreatePostModal';
import BoardShareModal from '../components/BoardShareModal';
import MessageReactions from '../components/MessageReactions';
import ReplyButton from '../components/ReplyButton';
import ShareMessageModal from '../components/ShareMessageModal';
import InlineMessageInput from '../components/InlineMessageInput';
import EditBoardModal from '../components/EditBoardModal';

import useInfiniteScroll from '../hooks/useInfiniteScroll';

import { generatePseudonym } from '../lib/PseudoGenerator';

const BoardView = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [board, setBoard] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ message_count: 0, reaction_count: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareMessage, setShareMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const MESSAGES_PER_PAGE = 20;

    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setShowShareModal(true);
            // Clean up the URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('new');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const [presenceCount, setPresenceCount] = useState(0);

    useEffect(() => {
        if (!board) return;

        // 1. Subscribe to New Messages
        const channel = supabase
            .channel(`board:${board.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `board_id=eq.${board.id}`
            }, (payload) => {
                if (!payload.new.parent_id) {
                    setMessages(prev => [payload.new, ...prev]);
                    setStats(prev => ({ ...prev, message_count: prev.message_count + 1 }));
                }
            })
            // 2. Presence Tracking
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                setPresenceCount(Object.keys(state).length);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user?.id || 'guest',
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [board, user]);

    useEffect(() => {
        fetchBoardData(0, true);
    }, [slug, user]);

    const fetchBoardData = async (pageNumber = 0, reset = false) => {
        if (!reset && !hasMore) return;

        setLoading(true);
        setError(null);
        try {
            // Only reset board state if we're on a deep refresh or slug changed
            if (reset && (!board || board.slug !== slug)) {
                setBoard(null);
                setMessages([]);
                setHasMore(true);
                setPage(0);
            }

            let currentBoard = board;

            // Fetch Board Details only on initial load or slug change
            if (reset && (!board || board.slug !== slug)) {
                const { data: boardData, error: boardError } = await supabase
                    .from('boards')
                    .select('*, profiles(*)')
                    .eq('slug', slug)
                    .maybeSingle();

                if (boardError) throw boardError;

                if (!boardData) {
                    setError('Board not found. It might have been deleted or moved.');
                    setLoading(false);
                    return;
                }

                setBoard(boardData);
                currentBoard = boardData;

                // Check ownership
                const owner = user && boardData.creator_id === user.id;
                setIsOwner(owner);

                // Fetch Stats
                const { data: statsData, error: statsError } = await supabase
                    .rpc('get_board_stats', { board_uuid: boardData.id });

                if (!statsError && statsData) {
                    setStats(statsData);
                }
            }

            if (!currentBoard) return;

            // Fetch Messages
            const owner = user && currentBoard.creator_id === user.id;
            if (currentBoard.settings?.privacy === 'private' && !owner) {
                setMessages([]);
            } else {
                const from = pageNumber * MESSAGES_PER_PAGE;
                const to = from + MESSAGES_PER_PAGE - 1;

                const { data: msgsData, error: msgsError } = await supabase
                    .from('messages')
                    .select('*, profiles(pseudonym)')
                    .eq('board_id', currentBoard.id)
                    .is('parent_id', null)
                    .order('created_at', { ascending: false })
                    .range(from, to);

                if (msgsError) throw msgsError;

                if (msgsData.length < MESSAGES_PER_PAGE) {
                    setHasMore(false);
                }

                if (reset) {
                    setMessages(msgsData || []);
                } else {
                    setMessages(prev => [...prev, ...(msgsData || [])]);
                }

                setPage(pageNumber + 1);
            }

        } catch (err) {
            console.error('Error fetching board:', err);
            setError('Could not load board. It might be deleted.');
        } finally {
            setLoading(false);
        }
    };

    const lastMessageRef = useInfiniteScroll(() => {
        fetchBoardData(page);
    }, hasMore, loading);

    if (loading && !board) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="glass-card animate-pulse h-20" />
                    <div className="glass-card animate-pulse h-32" />
                    <div className="glass-card animate-pulse h-32" />
                </div>
            </Layout>
        );
    }

    if (error || !board) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto text-center pt-20">
                    <div className="text-6xl mb-6">👻</div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {error?.includes('found') ? 'Board Not Found' : 'Something went wrong'}
                    </h2>
                    <p className="text-secondary mb-8">{error || 'Could not load board data. Please try again.'}</p>
                    <button onClick={() => navigate('/dashboard')} className="glass-button bg-white text-gray-900 border-none hover:bg-white/90 font-bold px-8">
                        Go to Dashboard
                    </button>
                </div>
            </Layout>
        );
    }

    const isPrivate = board.settings?.privacy === 'private';
    const canShare = !isPrivate || isOwner;

    return (
        <Layout>
            <div className={`max-w-2xl mx-auto space-y-6 ${!user ? 'pb-24' : ''}`}>
                {/* Privacy Notice */}
                {isPrivate && !isOwner && (
                    <div className="glass-card bg-yellow-500/10 border-yellow-500/20 border-l-4 border-l-yellow-500">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-yellow-400 mb-1">Private Board</h3>
                                <p className="text-sm text-secondary">
                                    This is a private board. Only the board owner can see messages posted here.
                                    Your message will be <span className="font-semibold text-primary">completely anonymous</span> to the owner.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Board Header */}
                <div className="glass-card border-none relative overflow-hidden p-6 md:p-8">
                    {/* Background Flare */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />

                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-4">
                                {board.profiles?.avatar_seed ? (
                                    <div className="relative group flex-shrink-0">
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${board.profiles.avatar_seed}`}
                                            alt="Avatar"
                                            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-black border-2 border-white/10 p-1 object-cover shadow-2xl"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-xl">
                                        🎭
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1 break-words leading-tight">{board.title}</h1>
                                    <div className="flex items-center gap-2">
                                        {!isOwner && board.profiles?.pseudonym && (
                                            <span className="text-secondary text-sm font-medium flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-secondary/50 rounded-full"></span>
                                                by {board.profiles.pseudonym}
                                            </span>
                                        )}
                                        {isOwner && (
                                            <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shadow-sm">
                                                My Board
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-y-3 gap-x-4 text-xs md:text-sm text-secondary font-medium">
                                <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${isPrivate ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></span>
                                        <span className={`${isPrivate ? 'text-yellow-400' : 'text-green-400'} text-[10px] md:text-xs uppercase tracking-widest font-black`}>
                                            {isPrivate ? 'Private' : 'Public'}
                                        </span>
                                    </div>
                                    <span className="w-px h-3 bg-white/10"></span>
                                    <span className="whitespace-nowrap">{stats.message_count} messages</span>
                                    <span className="w-px h-3 bg-white/10"></span>
                                    <span className="whitespace-nowrap">{stats.reaction_count} likes</span>
                                </div>

                                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/10">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] md:text-xs font-black tracking-widest uppercase whitespace-nowrap">{presenceCount} Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0 mt-2 md:mt-0">
                            {canShare && (
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="glass-button flex items-center justify-center gap-2 text-xs md:text-sm px-6 py-3.5 flex-1 md:flex-none bg-white/5 border-white/10 hover:bg-white/10 text-white font-black transition-all active:scale-95 uppercase tracking-widest"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share
                                </button>
                            )}
                            {isOwner && (
                                <div className="flex items-center gap-2 w-full md:w-auto flex-1 md:flex-none">
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="glass-button bg-white/5 text-white hover:bg-white/10 p-3.5 flex-shrink-0 border-white/10 transition-all active:scale-90"
                                        title="Board Settings"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="glass-button bg-white text-gray-400 border-none hover:bg-white/90 text-xs md:text-sm px-8 py-3.5 flex-1 font-black whitespace-nowrap active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-widest"
                                    >
                                        New Post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Inline Message Input (Frictionless for Guests/Visitors) */}
                    {!isOwner && (
                        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <InlineMessageInput
                                boardId={board.id}
                                onSuccess={() => {
                                    setPage(0);
                                    setHasMore(true);
                                    fetchBoardData(0, true);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Messages List */}
                <div className="space-y-4">
                    {isPrivate && !isOwner ? (
                        <div className="text-center py-12 text-secondary">
                            <p className="mb-2">Your messages are visible only to the board owner.</p>
                            <p className="text-sm">Send anonymously using the button below.</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-secondary">
                            <p>No messages yet. Be the first to speak!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isLast = index === messages.length - 1;
                            const pseudonym = msg.profiles?.pseudonym || generatePseudonym(msg.id);

                            return (
                                <div
                                    key={msg.id}
                                    ref={isLast ? lastMessageRef : null}
                                    className="group relative glass-card p-4 rounded-[2.5rem] hover:bg-white/[0.05] transition-all duration-500 animate-slide-up overflow-hidden border border-white/5"
                                >
                                    {/* Subtle decorative glow */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.04] transition-colors duration-700" />

                                    <div className="relative flex flex-col h-full">
                                        {/* Meta Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-white/30 group-hover:text-white/60 transition-colors shadow-inner capitalize">
                                                    {pseudonym.slice(0, 1)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-white/80 transition-colors">
                                                        {pseudonym}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-blue-400/30 uppercase tracking-widest mt-0.5 group-hover:text-blue-400/50 transition-colors">Anonymous Ghost</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/5 group-hover:border-white/10 transition-colors">
                                                <span className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <p className="text-xl sm:text-2xl font-medium text-white/90 leading-tight mb-4 break-words group-hover:text-white transition-colors">
                                            {msg.content}
                                        </p>

                                        {/* Action Footer */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5 mt-auto">
                                            <div className="flex-1 min-w-[150px]">
                                                <MessageReactions messageId={msg.id} />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setShareMessage(msg)}
                                                    className="p-3 rounded-2xl bg-white/5 text-gray-500 hover:bg-white hover:text-black transition-all active:scale-90 shadow-lg border border-white/5 group/share"
                                                    title="Share as Image"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                </button>
                                                <ReplyButton messageId={msg.id} replyCount={msg.reply_count} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {loading && messages.length > 0 && (
                        <div className="glass-card animate-pulse h-32 flex items-center justify-center text-secondary">
                            Loading more...
                        </div>
                    )}
                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setPage(0);
                    setHasMore(true);
                    fetchBoardData(0, true);
                }}
                boardId={board.id}
            />

            <EditBoardModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                board={board}
                onUpdate={(updatedBoard) => {
                    if (updatedBoard.slug !== board.slug) {
                        // Use the acquisition flag to show share modal after redirect
                        navigate(`/b/${updatedBoard.slug}?new=true`, { replace: true });
                    } else {
                        setBoard(updatedBoard);
                        setShowShareModal(true);
                    }
                }}
            />

            <BoardShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                board={board}
                isOwner={isOwner}
                onEditSlug={() => {
                    setShowShareModal(false);
                    setIsEditModalOpen(true);
                }}
            />

            <ShareMessageModal
                isOpen={!!shareMessage}
                onClose={() => setShareMessage(null)}
                message={shareMessage}
                boardTitle={board.title}
            />

            {/* Sticky Footer for Guests */}
            {!user && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-white/10 z-50 animate-slide-up">
                    <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <h3 className="font-bold text-white">Join the Conversation</h3>
                            <p className="text-sm text-secondary">
                                Post anonymously. No account needed.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="glass-button bg-white text-gray-400 hover:bg-white/90 whitespace-nowrap px-6 font-bold"
                        >
                            Send Anonymously
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default BoardView;
