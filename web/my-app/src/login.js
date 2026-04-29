import './login.css';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaGoogle, FaGithub } from 'react-icons/fa';
import { logUser, logWithGoogle, logWithGithub, checkRole } from './auth.js';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes('@gmail.com')) {
      setError('Invalid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasLetter || !hasNumberOrSymbol) {
      setError('Password must contain at least one letter and one number or symbol');
      return;
    }

    const user = await logUser(email, password);
    if (user === 'no-user') {
      setError('No account found with this email');
    } else if (user === 'wrong-password') {
      setError('Wrong password, please try again');
    } else if (user) {
      const role = await checkRole(user.uid);
      navigate(role === 'admin' ? '/dashboard' : '/home');
    } else {
      setError('Login failed. Please try again');
    }
  };

  const handleGoogle = async () => {
    const user = await logWithGoogle();
    if (user) {
      const role = await checkRole(user.uid);
      navigate(role === 'admin' ? '/dashboard' : '/home');
    } else {
      setError('Google login failed. Please try again.');
    }
  };

  const handleGithub = async () => {
    const user = await logWithGithub();
    if (user) {
      const role = await checkRole(user.uid);
      navigate(role === 'admin' ? '/dashboard' : '/home');
    } else {
      setError('GitHub login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <div className="login-subtitle">Access your account to upload projects</div>

        <form onSubmit={handleSubmit}>
          <label className="login-label">Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="Gmail only"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            required
          />

          <label className="login-label">Password</label>
          <div className="password-wrapper">
            <input
              className="login-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="login-swapper">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="login-divider">or continue with</div>

        <div className="social-buttons">
          <button className="google-btn" onClick={handleGoogle} type="button">
            <FaGoogle /> Google
          </button>
          <button className="github-btn" onClick={handleGithub} type="button">
            <FaGithub /> GitHub
          </button>
        </div>

        <div className="login-swapper">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;