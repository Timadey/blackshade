import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

import useInfiniteScroll from '../hooks/useInfiniteScroll';
import ConfirmationModal from '../components/ConfirmationModal';
import SEO from '../components/SEO';

const Dashboard = () => {
    const { user, profile } = useAuth();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const BOARDS_PER_PAGE = 20;
    const [filter, setFilter] = useState('all');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (user) fetchBoards(0, true);
    }, [user]);

    const fetchBoards = async (pageNumber = 0, reset = false) => {
        if (!reset && !hasMore) return;

        setLoading(true);
        try {
            const from = pageNumber * BOARDS_PER_PAGE;
            const to = from + BOARDS_PER_PAGE - 1;

            const { data, error } = await supabase
                .rpc('get_user_interacted_boards', { user_uuid: user.id })
                .range(from, to);

            if (error) throw error;

            if (data.length < BOARDS_PER_PAGE) {
                setHasMore(false);
            }

            if (reset) {
                setBoards(data || []);
            } else {
                setBoards(prev => [...prev, ...(data || [])]);
            }

            setPage(pageNumber + 1);
        } catch (error) {
            console.error('Error fetching boards:', error);
        } finally {
            setLoading(false);
        }
    };

    const lastBoardRef = useInfiniteScroll(() => {
        fetchBoards(page);
    }, hasMore, loading);

    const filteredBoards = boards.filter(board => {
        if (filter === 'owned') return board.creator_id === user.id;
        if (filter === 'interacted') return board.creator_id !== user.id;
        return true;
    });

    const ownedCount = boards.filter(b => b.creator_id === user.id).length;
    const interactedCount = boards.filter(b => b.creator_id !== user.id).length;

    const handleQuickCreate = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Ensure Profile exists (Race condition check)
            let activeProfile = profile;
            if (!activeProfile) {
                // Try one immediate fetch if profile is missing from context
                const { data: pf } = await supabase.from('profiles').select('id').eq('id', user.id).single();
                activeProfile = pf;
            }

            if (!activeProfile) {
                throw new Error("Your profile is still being set up. Please wait a moment.");
            }

            // 2. Generate Slug
            const { generateUniqueSlug } = await import('../lib/slugUtils');
            const slug = await generateUniqueSlug(supabase);

            // 3. Insert Board
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

            if (error) {
                // If we get the specific notification FK error, it means there's a trigger 
                // but our profile check above should have caught the missing profile.
                throw error;
            }

            window.location.href = `/b/${data.slug}?new=true`;
        } catch (error) {
            console.error('Error quick creating board:', error);
            alert(error.message || 'Failed to create board');
            setLoading(false);
        }
    };

    return (
        <Layout>
            <SEO title="My Corner" description="Manage your anonymous boards and secrets on Blackshade." />
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="animate-fade-in">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Your Corner</h2>
                        <p className="text-secondary text-sm md:text-base font-medium">Manage your anonymous boards and interactions.</p>
                    </div>
                    <div className="flex items-center gap-3 animate-fade-in">
                        <Link to="/create-board" className="glass-button bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] py-3.5 px-6 border-white/5 active:scale-95 transition-all">
                            Custom Board
                        </Link>
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={loading}
                            className="glass-button font-bold bg-white text-white hover:bg-white/90 uppercase tracking-widest text-[10px] py-3.5 px-6 shadow-xl shadow-white/5 active:scale-95 transition-all"
                        >
                            ⚡ Quick Create
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    {/* Stats Cards */}
                    <div className="glass-card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl -mr-8 -mt-8"></div>
                        <h3 className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Boards</h3>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white leading-none">{boards.length}</p>
                            <span className="text-secondary text-xs font-bold mb-1 italic opacity-50">all time</span>
                        </div>
                    </div>

                    <div className="glass-card bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl -mr-8 -mt-8"></div>
                        <h3 className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-4">Owned Boards</h3>
                        <p className="text-4xl font-black text-white leading-none">{ownedCount}</p>
                    </div>

                    <div className="glass-card bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -mr-8 -mt-8"></div>
                        <h3 className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-4">Interactions</h3>
                        <p className="text-4xl font-black text-white leading-none">{interactedCount}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl w-fit mb-8 border border-white/5 mx-auto sm:mx-0">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-secondary hover:text-white'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('owned')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'owned' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-secondary hover:text-white'}`}
                    >
                        My Boards
                    </button>
                    <button
                        onClick={() => setFilter('interacted')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'interacted' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-secondary hover:text-white'}`}
                    >
                        Joined
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {filteredBoards.map((board, index) => {
                        const isLast = index === filteredBoards.length - 1;
                        const boardIsOwned = board.creator_id === user.id;

                        return (
                            <div key={board.id} ref={isLast ? lastBoardRef : null}>
                                <Link to={`/b/${board.slug}`} className="glass-card group cursor-pointer block h-full p-6 sm:p-8 rounded-[2rem] hover:bg-white/[0.05] transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/5">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-2">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${board.settings?.privacy === 'public' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                {board.settings?.privacy || 'public'}
                                            </div>
                                            {boardIsOwned && (
                                                <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
                                                    Owner
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black text-secondary tracking-widest uppercase opacity-40">{new Date(board.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-xl font-black text-white group-hover:text-white mb-2 leading-tight transition-colors line-clamp-2">{board.title}</h4>
                                    <div className="flex items-center gap-2 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                                        <p className="text-[11px] text-secondary font-black uppercase tracking-[0.2em]">/{board.slug}</p>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}

                    {loading && (
                        [...Array(3)].map((_, i) => <div key={i} className="glass-card animate-pulse h-48 rounded-[2rem] border-white/5" />)
                    )}

                    {!loading && filteredBoards.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10 rounded-[2rem]">
                            <div className="text-4xl mb-4 opacity-20">🕳️</div>
                            <p className="text-secondary font-black uppercase tracking-[0.2em] text-xs">No boards found here</p>
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-4 text-blue-400 font-black uppercase tracking-widest text-[10px] hover:text-blue-300 transition-colors"
                                >
                                    View All Boards
                                </button>
                            )}
                        </div>
                    )}

                    {/* Create New Placeholder */}
                    <Link to="/create-board" className="glass-card border-dashed border-white/10 flex flex-col items-center justify-center text-secondary hover:text-white hover:border-white/30 cursor-pointer min-h-[200px] rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="font-black uppercase tracking-widest text-xs">Create New Board</span>
                    </Link>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleQuickCreate}
                title="Create Quick Board?"
                message="This will instantly create a new private anonymous board for you. You can share the link immediately after."
                confirmText="Create Board"
                cancelText="Maybe Later"
                icon="⚡"
            />
        </Layout>
    );
};

export default Dashboard;
