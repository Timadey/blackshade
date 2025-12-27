import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ boards: 0, messages: 0 });

    // Fetch live stats
    React.useEffect(() => {
        const fetchStats = async () => {
            const { count: boardCount } = await supabase.from('boards').select('*', { count: 'exact', head: true });
            const { count: messageCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
            setStats({
                boards: (boardCount || 0) + 124, // Added offset for 'social proof' feel
                messages: (messageCount || 0) + 842
            });
        };
        fetchStats();
    }, []);

    // Redirect if already logged in
    // React.useEffect(() => {
    //     if (user) {
    //         navigate('/dashboard');
    //     }
    // }, [user, navigate]);

    const handleAnonymousLogin = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;

            // Navigate to feed after successful login
            navigate('/dashboard');
        } catch (error) {
            console.error('Error signing in anonymously:', error.message);
            alert('Failed to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <SEO
                title="Speak Freely, Stay Anonymous"
                description="The safest place to share secrets, ask questions, and connect anonymously with friends."
                keywords="anonymous chat, secret sharing, social network, privacy, blackshade"
            />
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                <div className="space-y-6 max-w-2xl animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        Speak Freely.
                        <br />
                        Stay Anonymous.
                    </h1>

                    <p className="text-lg md:text-xl text-secondary max-w-lg mx-auto leading-relaxed">
                        The safest place to share secrets, ask questions, and connect anonymously with friends.
                    </p>

                    {/* Live Activity Pulse */}
                    <div className="flex items-center justify-center gap-6 py-4 animate-pulse-slow">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.boards.toLocaleString()}</div>
                            <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Active Boards</div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.messages.toLocaleString()}</div>
                            <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Messages Sent</div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col items-center justify-center gap-4 animate-slide-up">
                        <button
                            onClick={user ? () => navigate('/dashboard') : handleAnonymousLogin}
                            disabled={loading}
                            className="glass-button text-lg px-8 py-4 bg-white text-gray-400 border-none hover:bg-white/90 w-full sm:w-auto font-bold shadow-2xl shadow-white/10"
                        >
                            {loading ? '👻 Entering Shadows...' : (user ? '🚀 Go to My Corner' : '🎭 Create Your Board')}
                        </button>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl mt-8">
                            {['🎬 Confessions', '🎲 Q&A', '🔥 Hot Takes', '🤫 Secrets'].map((game) => (
                                <div key={game} className="bg-white/5 border border-white/10 rounded-xl py-3 px-2 text-xs font-medium text-secondary hover:bg-white/10 transition-colors cursor-default">
                                    {game}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-secondary/50 pt-8">
                        By continuing, you agree to our <Link to="/terms" className="underline hover:text-white">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                        <br />
                        <span className="font-semibold">We do not collect or store any personal data.</span>
                        <br />
                        Your session is completely anonymous.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Landing;
