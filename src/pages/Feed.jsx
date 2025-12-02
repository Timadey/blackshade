
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import CreatePostModal from '../components/CreatePostModal';
import MessageReactions from '../components/MessageReactions';
import ReplyButton from '../components/ReplyButton';

import useInfiniteScroll from '../hooks/useInfiniteScroll';

const Feed = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const MESSAGES_PER_PAGE = 20;

    useEffect(() => {
        fetchMessages(0, true);
    }, []);

    const fetchMessages = async (pageNumber = 0, reset = false) => {
        if (!reset && !hasMore) return;

        setLoading(true);
        try {
            const from = pageNumber * MESSAGES_PER_PAGE;
            const to = from + MESSAGES_PER_PAGE - 1;

            const { data, error } = await supabase
                .from('messages')
                .select('*, profiles(pseudonym)')
                .is('board_id', null)
                .is('parent_id', null)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (data.length < MESSAGES_PER_PAGE) {
                setHasMore(false);
            }

            if (reset) {
                setMessages(data || []);
            } else {
                setMessages(prev => [...prev, ...(data || [])]);
            }

            setPage(pageNumber + 1);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setPage(0);
        setHasMore(true);
        fetchMessages(0, true);
    };

    const lastMessageRef = useInfiniteScroll(() => {
        fetchMessages(page);
    }, hasMore, loading);

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Global Feed</h2>
                </div>

                {/* Create Post Input Trigger */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="glass-card mb-8 cursor-pointer hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="What's happening around you?"
                            className="bg-transparent border-none focus:ring-0 text-primary placeholder-secondary w-full cursor-pointer pointer-events-none"
                            readOnly
                        />
                    </div>
                </div>

                {/* Feed Stream */}
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        const isLast = index === messages.length - 1;
                        return (
                            <div
                                key={msg.id}
                                ref={isLast ? lastMessageRef : null}
                                className="glass-card animate-slide-up"
                            >
                                <p className="text-lg mb-4 leading-relaxed">{msg.content}</p>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-secondary font-medium mb-3">
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold text-white/80">
                                            {msg.profiles?.pseudonym || 'Anonymous'}
                                        </span>
                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <ReplyButton messageId={msg.id} replyCount={msg.reply_count} />
                                </div>
                                <MessageReactions messageId={msg.id} />
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="glass-card animate-pulse h-32 flex items-center justify-center text-secondary">
                            Loading more...
                        </div>
                    )}

                    {!hasMore && messages.length > 0 && (
                        <div className="text-center text-secondary py-8">
                            You've reached the end of the feed.
                        </div>
                    )}
                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRefresh}
            />
        </Layout>
    );
};

export default Feed;
