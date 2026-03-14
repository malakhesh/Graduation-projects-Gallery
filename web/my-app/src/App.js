import { auth } from './firebase.js';
import { checkRole } from './auth.js';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import Landing from './landing'; 
import Login from './login';
import Register from './register';
import Home from './home';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Dashboard from './dashboard.js';
import Bookmarks from './Bookmarks';
import Profile from './Profile';
import Settings from './Settings';
import MyProjects from './MyProjects.js';
import AllProjects from './projectGarbage';

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  return children;
}

function AdminRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((r) => {
        setRole(r);
        setRoleLoading(false);
      });
    } else {
      setRoleLoading(false);
    }
  }, [user]);

  if (loading || roleLoading) return null;
  if (!user) return <Navigate to="/" />;
  if (role !== "admin") return <Navigate to="/home" />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
        <Route path="/all-projects" element={<ProtectedRoute><AllProjects /></ProtectedRoute>} />
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;