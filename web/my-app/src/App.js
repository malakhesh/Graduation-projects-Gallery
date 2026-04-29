import { auth } from './firebase.js';
import { checkRole, checkStatus } from './auth.js';
import { listenSettings } from './DashSettings.js';
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
import MaintenancePage from './MaintenancePage';
import RegistrationClosed from './RegistrationClosed';

export const RoleContext = createContext(null);
export const SettingsContext = createContext(null);

function PageSpinner() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgb(245, 239, 230)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        width: "44px", height: "44px",
        border: "4px solid rgb(196, 173, 150)",
        borderTopColor: "rgb(122, 78, 45)",
        borderRadius: "50%",
        animation: "app-spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes app-spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{
        marginTop: "16px",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "14px",
        color: "rgb(160, 120, 80)",
        fontStyle: "italic",
      }}>
        Loading…
      </p>
    </div>
  );
}

function AppProviders({ children }) {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    if (user) checkRole(user.uid).then(setRole);
    else setRole(null);
  }, [user]);

  useEffect(() => {
    const unsub = listenSettings((data) => {
      setSiteSettings(data);
      document.title = data.siteName || "Graduation Gallery";
      setSettingsLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || settingsLoading) return <PageSpinner />;

  return (
    <SettingsContext.Provider value={siteSettings}>
      <RoleContext.Provider value={role}>
        {children}
      </RoleContext.Provider>
    </SettingsContext.Provider>
  );
}

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [statusData, setStatusData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const role = useContext(RoleContext);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    if (!user) { setStatusLoading(false); return; }
    checkStatus(user.uid).then((res) => {
      setStatusData(res);
      setStatusLoading(false);
    });
  }, [user]);

  if (loading || statusLoading) return <PageSpinner />;
  if (!user) return <Navigate to="/" />;

  if (statusData?.status === "suspended") {
    const now = new Date();
    const until = statusData.suspendedUntil?.toDate
      ? statusData.suspendedUntil.toDate()
      : statusData.suspendedUntil
        ? new Date(statusData.suspendedUntil)
        : null;
    if (!until || now < until) {
      return (
        <Suspended
          suspendedUntil={statusData.suspendedUntil}
          suspendReasons={statusData.suspendReasons}
        />
      );
    }
  }

  if (settings?.maintenanceMode && role !== "admin") {
    return <MaintenancePage />;
  }

  return children;
}

function AdminRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const role = useContext(RoleContext);

  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/" />;
  if (role === null) return <PageSpinner />;
  if (role !== "admin") return <Navigate to="/home" />;
  return children;
}

function RegistrationRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const role = useContext(RoleContext);
  const settings = useContext(SettingsContext);

  if (loading || !settings) return <PageSpinner />;
  if (!settings.registrationOpen && role !== "admin") return <RegistrationClosed />;
  return children;
}

function App() {
  return (
    <Router>
      <AppProviders>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<RegistrationRoute><Register /></RegistrationRoute>} />
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