import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Feed from './pages/Feed';
import Dashboard from './pages/Dashboard';
import CreateBoard from './pages/CreateBoard';
import BoardView from './pages/BoardView';
import Landing from './pages/Landing';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/board/create" element={<CreateBoard />} />
          <Route path="/b/:slug" element={<BoardView />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
