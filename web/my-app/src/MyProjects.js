import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from './home.js';
import EmptyProjects from './EmptyProjects';

// Replace with real Firebase fetch later
const mockProjects = [];

function MyProjects() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
    }
  }, [user]);

  useEffect(() => {
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 400);
  }, []);

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        <section className="hg-section">
          <h2 className="hg-section-title">My Projects</h2>
          {loading ? (
            <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
          ) : projects.length === 0 ? (
            <EmptyProjects />
          ) : (
            <div className="hg-projects-grid">
              {/* Project cards will go here once backend is wired */}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyProjects;