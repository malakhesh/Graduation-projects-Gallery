import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./landing.css";
import heroImage from "./photo.jpg";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.backgroundColor = 'rgb(223, 205, 192)';
    document.body.style.boxSizing = 'border-box';

    return () => {
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.body.style.boxSizing = '';
    };
  }, []);

  const [formData, setFormData] = useState({ name: "", email: "", role: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.name.trim() === "") newErrors.name = "Name is required";
    if (formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      newErrors.email = "Enter a valid email";
    }
    if (formData.role === "") newErrors.role = "Please select a role";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validateForm();
    setErrors(v);
    if (Object.keys(v).length === 0) {
      alert("Form submitted successfully!");
      setFormData({ name: "", email: "", role: "" });
      setErrors({});
    }
  };

  const handleBrowseProjects = () => navigate("/gallery");
  const handleUploadProject = () => alert("Later this button will open Upload Project page");

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo">GP Gallery</Link>
        <ul className="nav-links">
          <li onClick={handleBrowseProjects}>Gallery</li>
          <li><a href="#about">About</a></li>
          <li onClick={() => navigate("/login")}>Login</li>
          <li onClick={() => navigate("/signup")}>Register</li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-image-box">
            <img src={heroImage} alt="Graduation projects" className="hero-image" />
          </div>
          <div className="hero-text">
            <h1>Explore Graduation Projects in One Place</h1>
            <p>
              Discover inspiring graduation projects, explore technologies used,
              and learn from previous students&apos; work in one organized platform.
            </p>
            <div className="hero-buttons">
              <button className="btn primary" onClick={handleBrowseProjects}>Browse Projects</button>
              <button className="btn secondary" onClick={handleUploadProject}>Upload Your Project</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Platform Features</h2>
        <p className="section-subtitle">The platform helps students and faculty explore projects easily.</p>
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
          Graduation Projects Gallery Portal is a centralized platform to showcase graduation
          projects for Computer Science students. It helps preserve project work, inspire new
          students, and support faculty evaluation.
        </p>
      </section>

      {/* Form */}
      <section className="join-section">
        <h2>Register Your Interest</h2>
        <form className="join-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
            {errors.name && <small className="error">{errors.name}</small>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
            {errors.email && <small className="error">{errors.email}</small>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="guest">Guest</option>
            </select>
            {errors.role && <small className="error">{errors.role}</small>}
          </div>
          <button type="submit" className="btn primary full-width">Submit</button>
        </form>
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