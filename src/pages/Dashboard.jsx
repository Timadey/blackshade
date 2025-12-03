import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

import useInfiniteScroll from '../hooks/useInfiniteScroll';

const Dashboard = () => {
    const { user } = useAuth();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const BOARDS_PER_PAGE = 20;

    useEffect(() => {
        if (user) fetchBoards(0, true);
    }, [user]);

    const fetchBoards = async (pageNumber = 0, reset = false) => {
        if (!reset && !hasMore) return;

        setLoading(true);
        try {
            // Use the RPC function to get boards the user has interacted with
            // Note: Pagination for RPC returning SETOF is tricky with range(), 
            // so we might fetch all or handle it differently. 
            // For now, let's try fetching all (assuming user interaction history isn't massive yet)
            // or we can modify the RPC to accept limit/offset.

            // Actually, Supabase RPC supports range() if it returns a set.
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

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Your Dashboard</h2>
                    <Link to="/create-board" className="glass-button bg-white/10 hover:bg-white/20">
                        + Create Board
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stats Card */}
                    <div className="glass-card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/10">
                        <h3 className="text-secondary text-sm font-medium uppercase tracking-wider mb-1">Total Boards</h3>
                        <p className="text-4xl font-bold text-white">{boards.length}</p>
                    </div>

                    <div className="glass-card bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-white/10">
                        <h3 className="text-secondary text-sm font-medium uppercase tracking-wider mb-1">Messages Posted</h3>
                        <p className="text-4xl font-bold text-white">-</p>
                    </div>
                </div>

                <h3 className="text-xl font-bold mt-12 mb-6">Your Boards & Interactions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board, index) => {
                        const isLast = index === boards.length - 1;
                        return (
                            <div key={board.id} ref={isLast ? lastBoardRef : null}>
                                <Link to={`/b/${board.slug}`} className="glass-card group cursor-pointer block h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${board.settings?.privacy === 'public' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {board.settings?.privacy || 'public'}
                                        </div>
                                        <span className="text-xs text-secondary">{new Date(board.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{board.title}</h4>
                                </Link>
                            </div>
                        );
                    })}

                    {loading && (
                        [...Array(3)].map((_, i) => <div key={i} className="glass-card animate-pulse h-32" />)
                    )}

                    {/* Create New Placeholder */}
                    <Link to="/create-board" className="glass-card border-dashed border-white/20 flex flex-col items-center justify-center text-secondary hover:text-primary hover:border-white/40 cursor-pointer min-h-[150px]">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium">Create New Board</span>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
