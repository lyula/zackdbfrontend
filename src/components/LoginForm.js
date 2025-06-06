import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export default function LoginForm({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);

      // Fetch user info after login
      const userRes = await fetch(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = await userRes.json();
      if (setUser) setUser(user);

      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        timer: 1200,
        showConfirmButton: false
      });
      setTimeout(() => navigate('/dashboard'), 1200); // <-- redirect to dashboard
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed. Check your email or password.';
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: msg.replace(/username/gi, 'email')
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(99,102,241,0.13)',
          padding: '28px 28px 24px 28px',
          minWidth: 320,
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6
        }}
      >
        <div style={{
          fontSize: 40,
          marginBottom: 4,
          color: 'transparent',
          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text'
        }}>
          <span role="img" aria-label="lock">🔒</span>
        </div>
        <h2 style={{
          color: 'transparent',
          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          fontWeight: 900,
          fontSize: 22,
          marginBottom: 12,
          letterSpacing: '-1px'
        }}>
          Login to ZackDB
        </h2>
        {/* Email Field */}
        <div style={{ width: '100%', marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label htmlFor="email" style={{
            display: 'block',
            marginBottom: 4,
            fontWeight: 700,
            color: '#6366f1',
            fontSize: 14,
            letterSpacing: '0.2px',
            alignSelf: 'center'
          }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: 220,
              padding: '10px 14px',
              fontSize: 15,
              borderRadius: 8,
              border: '1.5px solid #6366f1',
              outline: 'none',
              background: 'rgba(248,250,252,0.95)',
              color: '#23272f',
              boxShadow: '0 2px 12px #6366f122',
              transition: 'border 0.2s',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
            autoComplete="email"
          />
        </div>
        {/* Password Field */}
        <div style={{
          width: 220,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <label htmlFor="password" style={{
            display: 'block',
            marginBottom: 4,
            fontWeight: 700,
            color: '#6366f1',
            fontSize: 14,
            letterSpacing: '0.2px',
            alignSelf: 'center'
          }}>
            Password
          </label>
          <div style={{
            position: 'relative',
            width: 220,
            display: 'flex',
            alignItems: 'center'
          }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: 220,
                padding: '10px 38px 10px 14px',
                fontSize: 15,
                borderRadius: 8,
                border: '1.5px solid #6366f1',
                outline: 'none',
                background: 'rgba(248,250,252,0.95)',
                color: '#23272f',
                boxShadow: '0 2px 12px #6366f122',
                transition: 'border 0.2s',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
              autoComplete="current-password"
            />
            <span
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                fontSize: 18,
                color: '#6366f1',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              role="button"
            >
              {showPassword ? (
                // Eye-off icon
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                  <path d="M2 2L20 20" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17.94 13.12C16.19 15.36 13.7 17 11 17C6.5 17 2.73 13.61 1.5 11.99C1.18 11.56 1.18 10.94 1.5 10.51C2.13 9.62 3.22 8.32 4.81 7.19M7.5 4.5C8.61 4.18 9.78 4 11 4C15.5 4 19.27 7.39 20.5 9.01C20.82 9.44 20.82 10.06 20.5 10.49C20.18 10.92 19.09 12.22 17.5 13.35" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                // Eye icon
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                  <ellipse cx="11" cy="11" rx="9.5" ry="6.5" stroke="#6366f1" strokeWidth="2"/>
                  <circle cx="11" cy="11" r="3" stroke="#6366f1" strokeWidth="2"/>
                </svg>
              )}
            </span>
          </div>
        </div>
        {/* Login Button */}
        <button
          type="submit"
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 0',
            width: 220,
            fontWeight: 800,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #6366f133',
            letterSpacing: '0.5px',
            marginBottom: 4,
            transition: 'background 0.2s',
            alignSelf: 'center'
          }}
        >
          <span role="img" aria-label="login" style={{ marginRight: 8 }}>🔑</span>
          Login
        </button>
        {/* Register Link */}
        <div style={{ marginTop: 8, fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}