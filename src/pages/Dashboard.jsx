import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Dashboard = () => {
    const { user } = useAuth();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchBoards();
    }, [user]);

    const fetchBoards = async () => {
        try {
            const { data, error } = await supabase
                .from('boards')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBoards(data || []);
        } catch (error) {
            console.error('Error fetching boards:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Your Dashboard</h2>
                    <Link to="/board/create" className="glass-button bg-white/10 hover:bg-white/20">
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

                <h3 className="text-xl font-bold mt-12 mb-6">Your Boards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="glass-card animate-pulse h-32" />)
                    ) : (
                        boards.map((board) => (
                            <Link key={board.id} to={`/b/${board.slug}`} className="glass-card group cursor-pointer block">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${board.settings?.privacy === 'public' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {board.settings?.privacy || 'public'}
                                    </div>
                                    <span className="text-xs text-secondary">{new Date(board.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{board.title}</h4>
                            </Link>
                        ))
                    )}

                    {/* Create New Placeholder */}
                    <Link to="/board/create" className="glass-card border-dashed border-white/20 flex flex-col items-center justify-center text-secondary hover:text-primary hover:border-white/40 cursor-pointer min-h-[150px]">
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
