import './login.css';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { logUser } from './auth.js';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    if (user) {
      console.log('Login successful');
      // redirect here later
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <div className='l'>Access your account to upload projects</div>
      <form onSubmit={handleSubmit}>
        <label className='label-email'>Email</label>
        <div>
          <input
            className='input-email'
            type="email"
            placeholder="Gmail only"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
          />
        </div>
        <label className='label-pass'>Password</label>
        <div className='password-wrapper'>
          <input
            className='input-password'
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            required
          />
          <span
            className='toggle-password'
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <div className='swapper'>don't have an account? <a href="/signup">Sign up</a></div>
    </div>
  );
}

export default Login;