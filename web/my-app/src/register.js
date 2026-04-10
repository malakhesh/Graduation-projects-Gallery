import "./register.css";
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(223, 205, 192)';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.display = '';
      document.body.style.justifyContent = '';
      document.body.style.alignItems = '';
      document.body.style.height = '';
      document.body.style.margin = '';
    };
  }, []);

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

    // ✅ Pass empty defaults for year and techStack
    const user = await regUser(email, password, fullName, "client", "", []);
    if (user === "email-in-use") {
      setError("This email is already registered. Please use a different email.");
    } else if (user) {
      console.log("Register successful");
      // redirect here later
    } else {
      setError("Registration failed. Please try again");
    }
  };

  return (
    <div className="signup-container">
      <h1>Register</h1>
      <div className="l">Create an account to upload projects</div>
      <form onSubmit={handleSubmit}>
        <label className="label-email">Full Name</label>
        <div>
          <input
            className="input-email"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setError("");
            }}
            required
          />
        </div>
        <label className="label-email">Email</label>
        <div>
          <input
            className="input-email"
            type="email"
            placeholder="Gmail only"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
          />
        </div>
        <label className="label-pass">Password</label>
        <div className="password-wrapper">
          <input
            className="input-password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <label className="label-pass2">Confirm Password</label>
        <div className="password-wrapper">
          <input
            className="input-password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Register</button>
      </form>
      <div className="swapper2">
        already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Register;