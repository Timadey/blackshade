import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';

const Layout = ({ children }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
        setShowLogoutModal(false);
    };

    return (
        <div className="min-h-screen text-primary font-sans selection:bg-white/20">
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2 group" aria-label="Blackshade Home">
                            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center group-hover:bg-white/20 transition-colors" aria-hidden="true">
                                <span className="font-bold text-lg">🕶</span>
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
                                    onClick={() => setShowLogoutModal(true)}
                                    className="text-sm font-medium text-secondary hover:text-primary transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="main-content">
                {children}
            </main>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleSignOut}
                title="Leave Identity Behind?"
                message={`⚠️ Warning: Signing out means you will lose access to this identity forever.

• Your posts will remain but you won't be able to edit or delete them.
• Next time you enter, you will be a completely new person with a new pseudonym.`}
                confirmText="Sign Out Forever"
                isDanger={true}
            />
        </div>
    );
};

export default Layout;
