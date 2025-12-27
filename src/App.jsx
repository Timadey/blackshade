import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/react';

import { registerServiceWorker, subscribeToPushNotifications } from './lib/pushNotifications';

// Lazy load pages
const Feed = lazy(() => import('./pages/Feed'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateBoard = lazy(() => import('./pages/CreateBoard'));
const BoardView = lazy(() => import('./pages/BoardView'));
const ThreadView = lazy(() => import('./pages/ThreadView'));
const Landing = lazy(() => import('./pages/Landing'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const initNotifications = async () => {
      await registerServiceWorker();
      if (user) {
        await subscribeToPushNotifications(user.id);
      }
    };
    initNotifications();
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Landing />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/feed" element={user ? <Feed /> : <Landing />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Landing />} />
        <Route path="/create-board" element={user ? <CreateBoard /> : <Landing />} />
        <Route path="/b/:slug" element={<BoardView />} />
        <Route path="/thread/:messageId" element={<ThreadView />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes >
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
