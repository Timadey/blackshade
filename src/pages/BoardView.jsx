import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CreatePostModal from '../components/CreatePostModal';
import BoardShareModal from '../components/BoardShareModal';
import MessageReactions from '../components/MessageReactions';

const BoardView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [board, setBoard] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        fetchBoardData();
    }, [slug, user]);

    const fetchBoardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Board Details by slug
            const { data: boardData, error: boardError } = await supabase
                .from('boards')
                .select('*')
                .eq('slug', slug)
                .single();

            if (boardError) throw boardError;
            setBoard(boardData);

            // Check if current user is the owner
            const owner = user && boardData.creator_id === user.id;
            setIsOwner(owner);

            // Fetch Messages - only show to owner if private
            if (boardData.settings?.privacy === 'private' && !owner) {
                // Non-owners of private boards see no messages
                setMessages([]);
            } else {
                const { data: msgsData, error: msgsError } = await supabase
                    .from('messages')
                    .select('*, profiles(pseudonym)')
                    .eq('board_id', boardData.id)
                    .order('created_at', { ascending: false });

                if (msgsError) throw msgsError;
                setMessages(msgsData || []);
            }

        } catch (err) {
            console.error('Error fetching board:', err);
            setError('Could not load board. It might be deleted.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
                    <p className="text-secondary mb-8">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="glass-button">
                        Go to Dashboard
                    </button>
                </div>
            </Layout>
        );
    }

    const isPrivate = board.settings?.privacy === 'private';
    const canShare = !isPrivate || isOwner; // Everyone can share public boards, only owners can share private boards

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Privacy Notice for Non-Owners of Private Boards */}
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
                <div className="glass-card border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{board.title}</h1>
                            <div className="flex items-center space-x-2 text-sm text-secondary">
                                <span className={`px-2 py-0.5 rounded ${isPrivate ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {isPrivate ? 'Private' : 'Public'}
                                </span>
                                <span>•</span>
                                <span>Created {new Date(board.created_at).toLocaleDateString()}</span>
                                {isOwner && <span className="text-purple-400 font-semibold">• You own this board</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {canShare && (
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="glass-button flex items-center gap-2 text-sm px-4 py-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share
                                </button>
                            )}
                            {user && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="glass-button bg-white text-black hover:bg-white/90 text-sm px-4 py-2"
                                >
                                    New Post
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="space-y-4">
                    {isPrivate && !isOwner ? (
                        <div className="text-center py-12 text-secondary">
                            <p className="mb-2">Your messages are visible only to the board owner.</p>
                            <p className="text-sm">Post anonymously using the button above.</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-secondary">
                            <p>No messages yet. Be the first to speak!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="glass-card animate-slide-up">
                                <p className="text-lg mb-4 leading-relaxed">{msg.content}</p>
                                <div className="flex items-center justify-between text-xs text-secondary font-medium">
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold text-white/80">
                                            {msg.profiles?.pseudonym || 'Anonymous'}
                                        </span>
                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <MessageReactions messageId={msg.id} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchBoardData}
                boardId={board.id}
            />

            <BoardShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                board={board}
            />
        </Layout>
    );
};

export default BoardView;
