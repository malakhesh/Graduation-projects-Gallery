import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from './home.js';

function MyProjects() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
    }
  }, [user]);

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        {/* My Projects content coming soon */}
      </main>
    </div>
  );
}

export default MyProjects;