
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import CreatePostModal from '../components/CreatePostModal';
import MessageReactions from '../components/MessageReactions';

const Feed = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [radius, setRadius] = useState(5000); // Default 5km

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // For now, just fetch all messages ordered by time
            // In a real scenario with PostGIS, we would use an RPC call to filter by distance
            // But since we are using raw SQL in the plan, we might need a custom RPC function for "nearby"
            // For this MVP step, let's just fetch recent messages globally or filter client side if small scale.
            // Or better, let's try to fetch all for now to ensure data flow works.

            // Fetch only messages WITHOUT a board_id (global feed messages only)
            const { data, error } = await supabase
                .from('messages')
                .select('*, profiles(pseudonym)')
                .is('board_id', null)  // Only get messages not associated with any board
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Global Feed</h2>
                    {/* Location filter placeholder */}
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
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="glass-card animate-pulse h-32" />
                        ))
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
                onSuccess={fetchMessages}
            />
        </Layout>
    );
};

export default Feed;
