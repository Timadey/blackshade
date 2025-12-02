import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Feed from './pages/Feed';
import Dashboard from './pages/Dashboard';
import CreateBoard from './pages/CreateBoard';
import BoardView from './pages/BoardView';
import ThreadView from './pages/ThreadView';
import Landing from './pages/Landing';
import LoadingScreen from './components/LoadingScreen';

import { registerServiceWorker, subscribeToPushNotifications } from './lib/pushNotifications';

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
    <Routes>
      <Route path="/" element={user ? <Feed /> : <Landing />} />
      <Route path="/feed" element={user ? <Feed /> : <Landing />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Landing />} />
      <Route path="/create-board" element={user ? <CreateBoard /> : <Landing />} />
      <Route path="/b/:slug" element={<BoardView />} />
      <Route path="/thread/:messageId" element={<ThreadView />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
