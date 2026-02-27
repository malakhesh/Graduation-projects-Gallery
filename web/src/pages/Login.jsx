import React from "react";
import MalakLogin from "./login";   
import "./authOverrides.css";      

export default function Login() {
  return (
    <div className="auth-page">
      <MalakLogin />
    </div>
  );
}