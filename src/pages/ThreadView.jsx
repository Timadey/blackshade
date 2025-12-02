import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import MessageReactions from '../components/MessageReactions';
import ReplyButton from '../components/ReplyButton';

import useInfiniteScroll from '../hooks/useInfiniteScroll';

const ThreadView = () => {
    const { messageId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [parentMessage, setParentMessage] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const REPLIES_PER_PAGE = 20;

    useEffect(() => {
        fetchThread(0, true);
    }, [messageId]);

    const fetchThread = async (pageNumber = 0, reset = false) => {
        if (!reset && !hasMore) return;

        setLoading(true);
        try {
            // Fetch parent message only on initial load
            if (reset) {
                const { data: parentData, error: parentError } = await supabase
                    .from('messages')
                    .select('*, profiles(pseudonym)')
                    .eq('id', messageId)
                    .single();

                if (parentError) throw parentError;
                setParentMessage(parentData);
            }

            // Fetch replies
            const from = pageNumber * REPLIES_PER_PAGE;
            const to = from + REPLIES_PER_PAGE - 1;

            const { data: repliesData, error: repliesError } = await supabase
                .from('messages')
                .select('*, profiles(pseudonym)')
                .eq('parent_id', messageId)
                .order('created_at', { ascending: true })
                .range(from, to);

            if (repliesError) throw repliesError;

            if (repliesData.length < REPLIES_PER_PAGE) {
                setHasMore(false);
            }

            if (reset) {
                setReplies(repliesData || []);
            } else {
                setReplies(prev => [...prev, ...(repliesData || [])]);
            }

            setPage(pageNumber + 1);
        } catch (error) {
            console.error('Error fetching thread:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!user || !replyContent.trim() || submitting) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    author_id: user.id,
                    board_id: parentMessage.board_id,
                    parent_id: messageId,
                    content: replyContent.trim(),
                    location: null // Replies don't need location
                }]);

            if (error) throw error;

            setReplyContent('');

            // Update parent message reply count locally
            setParentMessage(prev => ({
                ...prev,
                reply_count: (prev.reply_count || 0) + 1
            }));

            // Refresh thread to show new reply
            setPage(0);
            setHasMore(true);
            await fetchThread(0, true);
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const lastReplyRef = useInfiniteScroll(() => {
        fetchThread(page);
    }, hasMore, loading);

    if (loading && !parentMessage) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="glass-card animate-pulse h-32" />
                    <div className="glass-card animate-pulse h-24" />
                </div>
            </Layout>
        );
    }

    if (!parentMessage) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto text-center pt-20">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Message Not Found</h2>
                    <button onClick={() => navigate(-1)} className="glass-button">
                        Go Back
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Parent Message */}
                <div className="glass-card border-l-4 border-l-blue-500">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="font-bold text-white/80 mb-1">
                                {parentMessage.profiles?.pseudonym || 'Anonymous'}
                            </div>
                            <p className="text-lg leading-relaxed">{parentMessage.content}</p>
                        </div>
                    </div>
                    <div className="text-xs text-secondary mb-2">
                        {new Date(parentMessage.created_at).toLocaleString()}
                    </div>
                    <MessageReactions messageId={parentMessage.id} />
                </div>

                {/* Replies */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-secondary">
                        {parentMessage.reply_count || replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                    </h3>

                    {replies.map((reply, index) => {
                        const isLast = index === replies.length - 1;
                        return (
                            <div
                                key={reply.id}
                                ref={isLast ? lastReplyRef : null}
                                className="glass-card ml-8 animate-slide-up"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-bold text-white/80 text-sm mb-1">
                                            {reply.profiles?.pseudonym || 'Anonymous'}
                                        </div>
                                        <p className="leading-relaxed">{reply.content}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-secondary font-medium mb-3">
                                    <span>{new Date(reply.created_at).toLocaleString()}</span>
                                    <ReplyButton messageId={reply.id} replyCount={reply.reply_count} />
                                </div>
                                <MessageReactions messageId={reply.id} />
                            </div>
                        );
                    })}

                    {loading && replies.length > 0 && (
                        <div className="glass-card ml-8 animate-pulse h-24 flex items-center justify-center text-secondary">
                            Loading more replies...
                        </div>
                    )}
                </div>

                {/* Reply Input */}
                {user && (
                    <form onSubmit={handleReply} className="glass-card">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                            <div className="flex-1">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write your reply..."
                                    className="glass-input w-full min-h-[80px] resize-none"
                                    disabled={submitting}
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={!replyContent.trim() || submitting}
                                        className="glass-button bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Posting...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </Layout>
    );
};

export default ThreadView;
