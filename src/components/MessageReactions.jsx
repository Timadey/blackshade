import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ReactionPicker from './ReactionPicker';

const MessageReactions = ({ messageId }) => {
    const { user } = useAuth();
    const [reactions, setReactions] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReactions();

        // Subscribe to reaction changes
        const channel = supabase
            .channel(`reactions:${messageId}`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'reactions',
                    filter: `message_id=eq.${messageId}`
                },
                () => {
                    fetchReactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [messageId]);

    const fetchReactions = async () => {
        try {
            const { data, error } = await supabase
                .from('reactions')
                .select('*')
                .eq('message_id', messageId);

            if (error) throw error;

            // Group reactions by emoji
            const grouped = (data || []).reduce((acc, reaction) => {
                if (!acc[reaction.emoji]) {
                    acc[reaction.emoji] = {
                        emoji: reaction.emoji,
                        count: 0,
                        userReacted: false,
                        reactionId: null
                    };
                }
                acc[reaction.emoji].count++;
                if (user && reaction.user_id === user.id) {
                    acc[reaction.emoji].userReacted = true;
                    acc[reaction.emoji].reactionId = reaction.id;
                }
                return acc;
            }, {});

            setReactions(Object.values(grouped));
        } catch (error) {
            console.error('Error fetching reactions:', error);
        }
    };

    const handleReaction = async (emoji) => {
        if (!user || loading) return;

        setLoading(true);
        setShowPicker(false);

        try {
            // Check if user already reacted with this emoji
            const existingReaction = reactions.find(r => r.emoji === emoji && r.userReacted);

            if (existingReaction) {
                // Remove reaction
                const { error } = await supabase
                    .from('reactions')
                    .delete()
                    .eq('id', existingReaction.reactionId);

                if (error) throw error;
            } else {
                // Get all user's reactions for this message
                const { data: userReactions, error: fetchError } = await supabase
                    .from('reactions')
                    .select('*')
                    .eq('message_id', messageId)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (fetchError) throw fetchError;

                // If user already has 2 reactions, remove the oldest one
                if (userReactions && userReactions.length >= 2) {
                    const oldestReaction = userReactions[0];
                    const { error: deleteError } = await supabase
                        .from('reactions')
                        .delete()
                        .eq('id', oldestReaction.id);

                    if (deleteError) throw deleteError;
                }

                // Add new reaction
                const { error } = await supabase
                    .from('reactions')
                    .insert([{
                        message_id: messageId,
                        user_id: user.id,
                        emoji
                    }]);

                if (error) throw error;
            }

            await fetchReactions();
        } catch (error) {
            console.error('Error handling reaction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2 mt-3 flex-wrap relative">
            {reactions.map((reaction) => (
                <button
                    key={reaction.emoji}
                    onClick={() => handleReaction(reaction.emoji)}
                    disabled={!user || loading}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${reaction.userReacted
                        ? 'bg-blue-500/20 ring-1 ring-blue-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                        } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    <span className="text-base">{reaction.emoji}</span>
                    <span className="text-xs font-medium">{reaction.count}</span>
                </button>
            ))}

            {user && (
                <div className="relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-secondary hover:text-primary"
                        title="Add reaction"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    {showPicker && (
                        <ReactionPicker
                            onSelect={handleReaction}
                            onClose={() => setShowPicker(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageReactions;
