import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen text-primary font-sans selection:bg-white/20">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <span className="font-bold text-lg">B</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight">Blackshade</span>
                        </Link>

                        {user && (
                            <div className="flex items-center space-x-4">
                                <Link to="/feed" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                                    Feed
                                </Link>
                                <Link to="/dashboard" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="text-sm font-medium text-secondary hover:text-primary transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
