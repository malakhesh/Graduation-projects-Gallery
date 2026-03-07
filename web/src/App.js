import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import heroImage from "./assets/photo.jpg";

export default function App() {
  const navigate = useNavigate();

  const handleBrowseProjects = () => {
    navigate("/gallery");
  };

  const handleUploadProject = () => {
    alert("Later this button will open Upload Project page");
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo">
          GP Gallery
        </Link>

        <ul className="nav-links">
          <li onClick={handleBrowseProjects}>Gallery</li>

          <li>
            <a href="#about">About</a>
          </li>

          <li onClick={() => navigate("/login")}>Login</li>
          <li onClick={() => navigate("/register")}>Register</li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-image-box">
            <img
              src={heroImage}
              alt="Graduation projects"
              className="hero-image"
            />
          </div>

          <div className="hero-text">
            <h1>Explore Graduation Projects in One Place</h1>
            <p>
              Discover inspiring graduation projects, explore technologies used,
              and learn from previous students&apos; work in one organized
              platform.
            </p>

            <div className="hero-buttons">
              <button className="btn primary" onClick={handleBrowseProjects}>
                Browse Projects
              </button>

              <button className="btn secondary" onClick={handleUploadProject}>
                Upload Your Project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Platform Features</h2>
        <p className="section-subtitle">
          The platform helps students and faculty explore projects easily.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Smart Search</h3>
            <p>Search projects by name or technology used.</p>
          </div>

          <div className="feature-card">
            <h3>Filter by Year & Tech Stack</h3>
            <p>Filter projects by year and tech stack easily.</p>
          </div>

          <div className="feature-card">
            <h3>Faculty Reviews</h3>
            <p>View faculty ratings and comments on each project.</p>
          </div>

          <div className="feature-card">
            <h3>Project Documentation</h3>
            <p>Access project PDF files and GitHub links.</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <h2>About the Platform</h2>
        <p>
          Graduation Projects Gallery Portal is a centralized platform to
          showcase graduation projects for Computer Science students. It helps
          preserve project work, inspire new students, and support faculty
          evaluation.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <span>About</span>
          <span>Contact</span>
          <span>Team</span>
          <span>Copyright</span>
        </div>
        <p>© 2026 Graduation Projects Gallery Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}