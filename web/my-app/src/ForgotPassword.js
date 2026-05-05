import './ForgotPassword.css';
import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPass } from "./auth.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const result = await resetPass(email);

    if (result === "reset-sent") {
      setStatus("success");
      setMessage("Check your email for a reset link!");
    } else if (result === "no-user") {
      setStatus("error");
      setMessage("No account found with this email.");
    } else if (result === "invalid-email") {
      setStatus("error");
      setMessage("Please enter a valid email.");
    } else if (result === "too-many-requests") {
      setStatus("error");
      setMessage("Too many attempts. Please try again later.");
    } else {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <h2>Forgot Password</h2>
        <div className="forgot-subtitle">Enter your email to receive a reset link</div>

        {status === "success" ? (
          <p className="forgot-success">{message}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="forgot-label">Email</label>
            <input
              className="forgot-input"
              type="email"
              placeholder="Gmail only"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {status === "error" && <p className="forgot-error">{message}</p>}
            <button className="forgot-btn" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="forgot-back">
          Remembered it? <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}