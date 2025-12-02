import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/feed');
        }
    }, [user, navigate]);

    const handleAnonymousLogin = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;

            // Navigate to feed after successful login
            navigate('/feed');
        } catch (error) {
            console.error('Error signing in anonymously:', error.message);
            alert('Failed to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                <div className="space-y-6 max-w-2xl animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        Speak Freely.
                        <br />
                        Stay Anonymous.
                    </h1>

                    <p className="text-lg md:text-xl text-secondary max-w-lg mx-auto leading-relaxed">
                        Blackshade is a safe haven for your thoughts. Connect with people around you without revealing who you are.
                    </p>

                    <div className="pt-8 flex flex-col items-center justify-center gap-4 animate-slide-up">
                        <button
                            onClick={handleAnonymousLogin}
                            disabled={loading}
                            className="glass-button w-full sm:w-auto min-w-[280px] bg-white text-black hover:bg-white/90 disabled:opacity-50 text-lg py-3"
                        >
                            {loading ? 'Entering...' : '🎭 Enter Anonymously'}
                        </button>
                    </div>

                    <p className="text-xs text-secondary/50 pt-8">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
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
