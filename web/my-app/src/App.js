import { auth } from './firebase.js';
import { checkRole, checkStatus, suspendUser } from './auth.js';
import React, { useState, useEffect, createContext, useContext } from 'react';
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
import ProjectShare from './ProjectShare';
import Suspended from './suspended.js';

const RoleContext = createContext(null);

function AppProviders({ children }) {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then(setRole);
    } else {
      setRole(null);
    }
  }, [user]);

  if (loading) return null;

  return (
    <RoleContext.Provider value={role}>
      {children}
    </RoleContext.Provider>
  );
}

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [statusData, setStatusData] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    if (!user) { setStatusLoading(false); return; }
    checkStatus(user.uid).then((res) => {
      setStatusData(res)
      setStatusLoading(false)
    })
  }, [user])

  if (loading || statusLoading) return null;
  if (!user) return <Navigate to="/" />;

  if (statusData?.status === "suspended") {
    const now = new Date()
    const until = statusData.suspendedUntil?.toDate
      ? statusData.suspendedUntil.toDate()
      : statusData.suspendedUntil
        ? new Date(statusData.suspendedUntil)
        : null

    // suspension expired — let them through, auto-unsuspend handled by checkStatus
    if (until && now >= until) return children;

    return (
      <Suspended
        suspendedUntil={statusData.suspendedUntil}
        suspendReasons={statusData.suspendReasons}
      />
    )
  }

  return children;
}

function AdminRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const role = useContext(RoleContext);

  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  if (role === null) return null;
  if (role !== "admin") return <Navigate to="/home" />;
  return children;
}

function App() {
  return (
    <Router>
      <AppProviders>
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
          <Route path="/project/:id" element={<ProtectedRoute><ProjectShare /></ProtectedRoute>} />
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        </Routes>
      </AppProviders>
    </Router>
  );
}

export default App;