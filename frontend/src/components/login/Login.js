import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import '../login/components.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(""); // Clear error when user types again
  };
  const submit = async (e) => {
    e.preventDefault();
    axios.post('/login/check', formData)
      .then(res => {
        const token = res.data.token;
      localStorage.setItem("admin_token", token); 

      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode payload
      const {userId, role, candidateId, cid, email, username} = decoded;
      localStorage.setItem("userId", userId)
      localStorage.setItem("username", username)
      localStorage.setItem("email", email);
      localStorage.setItem('role',role);
        if(cid) localStorage.setItem('cid', cid);
        if (role === 'SuperAdmin') {
          navigate('/dashboard');
        } else if (role === 'admin') {
          navigate(`/admin/${cid}`);
        } else if (role === 'recruiter') {
          navigate(`/admin/${cid}`);
        }
      })
      .catch(err => {
        console.error('Login failed:', err);
        setError("Invalid email or password."); 
      });
  };
  return (
    <form onSubmit={submit}>
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <img src="/logo.png" alt="logo" className="logo" />
          </div>
          <div className="login-box">
            <input
              type="email"
              id="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="login-box">
            <input
              type="password"
              id="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>

          {/*  Error message */}
          {error && <p className="error-text">{error}</p>}

          <div className="remember-forget">
            <div className="rem-box">
              <input type="checkbox" id="remember" className="remember" />
              <label>Remember me</label>
            </div>
            <div className="forgot-link">
              <Link to={"/forgetPassword"}>Forgot Password?</Link>
            </div>
          </div>

          <button className="b btn mt20" type="submit">
            Login
          </button>
        </div>
      </div>
    </form>
  );
}

export default Login;
