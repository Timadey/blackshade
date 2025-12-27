import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getRandomPrompt } from '../lib/PseudoGenerator';

const CreatePostModal = ({ isOpen, onClose, onSuccess, boardId = null }) => {
    const { user, profile } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState(getRandomPrompt());

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            // Handle Guest User: Create anonymous account first
            let currentUser = user;
            if (!currentUser) {
                const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
                if (authError) throw authError;
                currentUser = authData.user;
            }

            // 1. Ensure Profile exists (Race condition check)
            // This is critical for guest users where the profile trigger might be delayed
            let activeProfile = profile;
            if (!activeProfile || activeProfile.id !== currentUser.id) {
                // Try one immediate fetch if profile is missing from context or mismatched
                const { data: pf } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
                activeProfile = pf;

                // If still missing, wait a tiny bit and try one more time
                if (!activeProfile) {
                    await new Promise(r => setTimeout(r, 500));
                    const { data: pf2 } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
                    activeProfile = pf2;
                }
            }

            if (!activeProfile) {
                throw new Error("Initializing your anonymous identity... please try again in a second.");
            }

            // Get current location only if it's a general feed post (no boardId)
            let location = null;
            if (!boardId && navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    // PostGIS point format: SRID=4326;POINT(lon lat)
                    location = `SRID=4326;POINT(${pos.coords.longitude} ${pos.coords.latitude})`;
                } catch (err) {
                    console.warn("Location access denied or failed", err);
                }
            }

            const { error } = await supabase
                .from('messages')
                .insert([
                    {
                        author_id: activeProfile.id, // Use the verified profile ID
                        board_id: boardId,
                        content,
                        location
                    }
                ]);

            if (error) throw error;

            setContent('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to post message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-secondary hover:text-primary"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-xl font-bold mb-4">Speak Freely</h3>

                {!user && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                        <p>An anonymous account will be created for you automatically when you post.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="relative mb-4">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={prompt}
                            className="glass-input w-full h-32 resize-none p-4 pb-12"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setPrompt(getRandomPrompt())}
                            className="absolute bottom-4 left-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-xl"
                            title="Random Prompt"
                        >
                            🎲
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button bg-white text-gray-400 hover:bg-white/90 disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Send Anonymously'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
