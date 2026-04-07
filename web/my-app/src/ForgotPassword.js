import './ForgotPassword.css';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { resetPass } from "./auth.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

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
    setStatus("loading");
    try {
      await resetPass(email);
      setStatus("success");
      setMessage("Check your email for a reset link!");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Password</h2>
      <div className="subtitle">Enter your email to receive a reset link</div>
      {status === "success" ? (
        <p style={{ color: "green" }}>{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Gmail only"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </button>
          {status === "error" && <p style={{ color: "red" }}>{message}</p>}
        </form>
      )}
      <div className="back-link">
        Remembered it? <Link to="/">Back to Login</Link>
      </div>
    </div>
  );
}