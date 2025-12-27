import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getRandomPrompt } from '../lib/PseudoGenerator';

const InlineMessageInput = ({ boardId, onSuccess }) => {
    const { user, profile } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isSent, setIsSent] = useState(false);

    useEffect(() => {
        setPrompt(getRandomPrompt());
    }, []);

    const handleDiceClick = () => {
        setPrompt(getRandomPrompt());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            let currentUser = user;
            if (!currentUser) {
                const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
                if (authError) throw authError;
                currentUser = authData.user;
            }

            // Ensure Profile exists (Race condition check)
            let activeProfile = profile;
            if (!activeProfile || activeProfile.id !== currentUser.id) {
                const { data: pf } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
                activeProfile = pf;

                if (!activeProfile) {
                    await new Promise(r => setTimeout(r, 500));
                    const { data: pf2 } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
                    activeProfile = pf2;
                }
            }

            if (!activeProfile) {
                throw new Error("Initializing your anonymous identity... please try again in a second.");
            }

            const { error } = await supabase
                .from('messages')
                .insert([
                    {
                        author_id: activeProfile.id,
                        board_id: boardId,
                        content: content.trim()
                    }
                ]);

            if (error) throw error;

            setContent('');
            setIsSent(true);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error sending message:', error);
            alert(error.message || 'Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickCreate = async () => {
        setLoading(true);
        try {
            let currentUser = user;
            if (!currentUser) {
                const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
                if (authError) throw authError;
                currentUser = authData.user;
            }

            // Ensure Profile exists (Race condition check)
            let activeProfile = profile;
            if (!activeProfile || activeProfile.id !== currentUser.id) {
                const { data: pf } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
                activeProfile = pf;

                if (!activeProfile) {
                    await new Promise(r => setTimeout(r, 500));
                    const { data: pf2 } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
                    activeProfile = pf2;
                }
            }

            if (!activeProfile) {
                throw new Error("Initializing your anonymous identity... please try again in a second.");
            }

            // Generate Slug
            const { generateUniqueSlug } = await import('../lib/slugUtils');
            const slug = await generateUniqueSlug(supabase);

            // Insert Board
            const { data, error } = await supabase
                .from('boards')
                .insert([{
                    slug,
                    creator_id: activeProfile.id,
                    title: 'Send me an anonymous message!',
                    settings: { privacy: 'private' }
                }])
                .select()
                .single();

            if (error) throw error;

            window.location.href = `/b/${data.slug}?new=true`;
        } catch (error) {
            console.error('Error quick creating board:', error);
            alert(error.message || 'Failed to create board');
            setLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="mt-6 relative overflow-hidden bg-gradient-to-br from-gray-600/20 to-white-600/20 rounded-2xl p-8 text-center border border-white/10 animate-fade-in group">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 via-gray-500 to-gray-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></div>

                <div className="text-5xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Message Sent!</h3>
                <p className="text-secondary text-sm mb-6">Your anonymous secret has been delivered.</p>

                <div className="space-y-4 relative">
                    <div className="bg-white text-gray-900 p-0.5 rounded-xl block transform transition-all active:scale-95 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <button
                            onClick={handleQuickCreate}
                            disabled={loading}
                            className="w-full bg-white text-gray-900 py-4 rounded-[10px] font-black uppercase tracking-widest text-sm disabled:opacity-50"
                        >
                            {loading ? 'Setting up...' : 'Get Your Own Messages'}
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-1 px-4 bg-white/5 rounded-full w-fit mx-auto border border-white/5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
                            {(142 + Math.floor(Math.random() * 20)).toLocaleString()} people joined today
                        </p>
                    </div>

                    <button
                        onClick={() => setIsSent(false)}
                        className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all pt-2"
                    >
                        ← Send Another One
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 bg-white/[0.03] rounded-2xl overflow-hidden group focus-within:ring-1 focus-within:ring-white/20 transition-all border border-white/5">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={prompt}
                        className="w-full bg-transparent border-none focus:ring-0 text-white p-6 pb-12 resize-none min-h-[120px] placeholder:text-white/30 text-lg md:text-xl font-medium"
                    />

                    {/* Dice Button */}
                    <button
                        type="button"
                        onClick={handleDiceClick}
                        className="absolute bottom-4 left-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-xl"
                        title="Random Prompt"
                    >
                        🎲
                    </button>

                    {/* Send Button - Only shows when typing */}
                    <div className={`absolute bottom-4 right-4 transition-all duration-300 ${content.trim() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all text-sm"
                        >
                            {loading ? '...' : 'Send!'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Guest Hint */}
            {!user && (
                <div className="bg-white/[0.02] px-6 py-2 border-t border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        Anonymous Message • No account needed
                    </p>
                </div>
            )}
        </div>
    );
};

export default InlineMessageInput;
