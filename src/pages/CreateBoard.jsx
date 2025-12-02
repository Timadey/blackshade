import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { generateUniqueSlug } from '../lib/slugUtils';
import Layout from '../components/Layout';
import BoardShareModal from '../components/BoardShareModal';

const CreateBoard = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [privacy, setPrivacy] = useState('public');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdBoard, setCreatedBoard] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            // Generate unique slug
            const slug = await generateUniqueSlug(supabase);

            const { data, error } = await supabase
                .from('boards')
                .insert([
                    {
                        slug,
                        creator_id: profile?.id || user.id,
                        title,
                        settings: { privacy }
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            // Show share modal instead of navigating immediately
            setCreatedBoard(data);
            setShowShareModal(true);
        } catch (error) {
            console.error('Error creating board:', error);
            alert('Failed to create board');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseShareModal = () => {
        setShowShareModal(false);
        navigate('/dashboard');
    };

    return (
        <Layout>
            <div className="max-w-xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">Create a New Board</h2>

                <form onSubmit={handleSubmit} className="glass-card space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Board Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Late Night Thoughts"
                            className="glass-input w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Privacy Setting</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`p-4 rounded-xl border transition-all ${privacy === 'public'
                                        ? 'bg-white/10 border-white/20 ring-2 ring-white/20'
                                        : 'bg-transparent border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <div className="font-bold mb-1">Public</div>
                                <div className="text-xs text-secondary">Anyone can view messages</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`p-4 rounded-xl border transition-all ${privacy === 'private'
                                        ? 'bg-white/10 border-white/20 ring-2 ring-white/20'
                                        : 'bg-transparent border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <div className="font-bold mb-1">Private</div>
                                <div className="text-xs text-secondary">Only you can view messages</div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button w-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Board'}
                        </button>
                    </div>
                </form>
            </div>

            <BoardShareModal
                isOpen={showShareModal}
                onClose={handleCloseShareModal}
                board={createdBoard}
            />
        </Layout>
    );
};

export default CreateBoard;
