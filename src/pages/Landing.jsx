import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

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
                            className="glass-button text-lg px-8 py-4 bg-white text-black hover:bg-white/90 w-full sm:w-auto"
                        >
                            {loading ? '👻 Entering Shadows...' : '🎭 Enter Anonymously'}
                        </button>

                        <div className="max-w-md mx-auto mt-6 text-sm text-secondary space-y-2 bg-white/5 p-4 rounded-lg border border-white/10">
                            <p>
                                <span className="text-primary font-semibold">Note:</span> A unique pseudonym will be created for you.
                            </p>
                            <p>
                                You will remain signed in on this device until you choose to sign out.
                            </p>
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
