import "./register.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { regUser } from './auth.js';

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters long");
      return;
    }
    if (!email.includes("@gmail.com")) {
      setError("Invalid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasLetter || !hasNumberOrSymbol) {
      setError("Password must contain at least one letter and one number or symbol");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const user = await regUser(email, password, fullName, "client", "", []);
    if (user === "email-in-use") {
      setError("This email is already registered. Please use a different email.");
    } else if (user) {
      console.log("Register successful");
    } else {
      setError("Registration failed. Please try again");
    }
  };

  return (
    <div className="register-page">
      <div className="signup-container">
        <h1>Register</h1>
        <div className="signup-subtitle">Create an account to upload projects</div>

        <form onSubmit={handleSubmit}>
          <label className="signup-label">Full Name</label>
          <input
            className="signup-input"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setError(""); }}
            required
          />

          <label className="signup-label">Email</label>
          <input
            className="signup-input"
            type="email"
            placeholder="Gmail only"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            required
          />

          <label className="signup-label">Password</label>
          <div className="password-wrapper">
            <input
              className="signup-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label className="signup-label">Confirm Password</label>
          <div className="password-wrapper">
            <input
              className="signup-input"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              required
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button type="submit" className="signup-btn">Register</button>
        </form>

        <div className="signup-swapper">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;