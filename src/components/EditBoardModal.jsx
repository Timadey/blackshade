import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const EditBoardModal = ({ isOpen, onClose, board, onUpdate }) => {
    const [title, setTitle] = useState(board?.title || '');
    const [slug, setSlug] = useState(board?.slug || '');
    const [privacy, setPrivacy] = useState(board?.settings?.privacy || 'public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (board) {
            setTitle(board.title);
            setSlug(board.slug);
            setPrivacy(board.settings?.privacy || 'public');
        }
    }, [board]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

        if (cleanSlug.length < 3) {
            setError('Slug must be at least 3 characters');
            setLoading(false);
            return;
        }

        try {
            // Check if slug is taken by someone else
            if (cleanSlug !== board.slug) {
                const { data: existing, error: checkError } = await supabase
                    .from('boards')
                    .select('id')
                    .eq('slug', cleanSlug)
                    .maybeSingle();

                if (existing) {
                    setError('This handle is already taken. Try another one.');
                    setLoading(false);
                    return;
                }
            }

            const { error: updateError } = await supabase
                .from('boards')
                .update({
                    title: title.trim(),
                    slug: cleanSlug,
                    settings: { ...board.settings, privacy }
                })
                .eq('id', board.id);

            if (updateError) throw updateError;

            onUpdate({ ...board, title, slug: cleanSlug, settings: { ...board.settings, privacy } });
            onClose();
        } catch (err) {
            console.error('Error updating board:', err);
            setError(err.message || 'Failed to update board');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full h-full sm:h-auto sm:max-w-lg relative sm:rounded-[2.5rem] p-6 md:p-10 flex flex-col justify-center overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-secondary hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all active:scale-90"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-8">
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">Board Settings</h3>
                    <p className="text-secondary text-sm font-medium">Customize how others see your board.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Board Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="glass-input w-full p-4 md:p-5 text-white text-lg font-bold placeholder:text-white/20 focus:ring-2 focus:ring-white/10"
                            placeholder="e.g., Ask me anything!"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Public Handle</label>
                        <div className="flex flex-col sm:flex-row sm:items-stretch group">
                            <span className="hidden sm:flex bg-white/5 border border-r-0 border-white/10 rounded-l-2xl px-5 items-center text-secondary font-bold text-sm">
                                blackshade.site/b/
                            </span>
                            <span className="sm:hidden block p-2 text-[10px] text-secondary font-black tracking-widest uppercase mb-1">blackshade.site/b/</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="glass-input flex-1 sm:rounded-l-none p-4 md:p-5 text-white font-black text-lg sm:text-base placeholder:text-white/20 focus:ring-2 focus:ring-white/10"
                                placeholder="my-board"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-red-400/60 mt-2 font-black uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Warning: Old links will break
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Privacy</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`p-4 md:p-5 rounded-2xl border transition-all text-left group ${privacy === 'public' ? 'bg-white/10 border-white/30 ring-2 ring-white/10 shadow-xl' : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                            >
                                <div className="font-black text-white text-sm uppercase tracking-widest mb-1">Public</div>
                                <div className="text-[10px] text-secondary font-medium leading-relaxed">Anyone can view and react to messages.</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`p-4 md:p-5 rounded-2xl border transition-all text-left group ${privacy === 'private' ? 'bg-white/10 border-white/30 ring-2 ring-white/10 shadow-xl' : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                            >
                                <div className="font-black text-white text-sm uppercase tracking-widest mb-1 text-yellow-400">Private</div>
                                <div className="text-[10px] text-secondary font-medium leading-relaxed">Only you can see incoming messages.</div>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-400 font-black uppercase tracking-widest animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 glass-button bg-white/5 text-white font-black uppercase tracking-widest text-xs py-4 border-white/5 hover:bg-white/10 active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 glass-button bg-white text-gray-400 border-none font-black uppercase tracking-widest text-xs py-4 hover:bg-white/90 active:scale-95 transition-all shadow-2xl shadow-white/10 disabled:opacity-50"
                        >
                            {loading ? 'Propagating...' : 'Update Board'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBoardModal;
