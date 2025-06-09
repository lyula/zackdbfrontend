import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MONGO_CONNECTION_STRING, DB_NAME, USER_COLLECTION } from '../constants';

const API_URL = 'https://zackdbbackend.onrender.com';

export default function LoginForm({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');
  const intervalRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      intervalRef.current = setInterval(() => {
        setDots(prev => (prev.length < 3 ? prev + '.' : ''));
      }, 400);
    } else {
      setDots('');
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connectionString: MONGO_CONNECTION_STRING,
          dbName: DB_NAME,
          collectionName: USER_COLLECTION,
          email,
          password
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || 'Login failed. Check your email or password.';
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: msg
        });
        setError(msg);
        setLoading(false);
        return;
      }

      // Fetch user info after login to update App state
      const userRes = await fetch(`${API_URL}/api/me`, {
        credentials: 'include'
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user || userData);
        localStorage.setItem('token', 'dummy');
        navigate('/dashboard', { replace: true });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Could not fetch user info after login.'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'An unexpected error occurred. Please try again.'
      });
      setError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
      }}
    >
      <form
        className="p-4 rounded-4 shadow-lg bg-white"
        style={{
          minWidth: 320,
          maxWidth: 370,
          width: '100%',
          border: 'none',
          background: 'rgba(255,255,255,0.96)'
        }}
        onSubmit={handleLogin}
      >
        <div className="text-center mb-2">
          <span
            role="img"
            aria-label="lock"
            style={{
              fontSize: 40,
              background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            🔒
          </span>
        </div>
        <h2
          className="text-center fw-bold mb-3"
          style={{
            fontSize: 22,
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-1px'
          }}
        >
          Login to ZackDB
        </h2>
        {/* Email Field */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold" style={{ color: '#6366f1', fontSize: 14 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            style={{
              border: '1.5px solid #6366f1',
              background: 'rgba(248,250,252,0.95)',
              color: '#23272f'
            }}
          />
        </div>
        {/* Password Field */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#6366f1', fontSize: 14 }}>
            Password
          </label>
          <div className="input-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                border: '1.5px solid #6366f1',
                background: '#f1f5ff', // Match register page background
                color: '#23272f',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                boxShadow: 'none',
                fontSize: 15,
                padding: '10px 12px'
              }}
            />
            <button
              type="button"
              className="btn"
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(v => !v)}
              style={{
                border: '1.5px solid #6366f1',
                borderLeft: 'none',
                background: '#f1f5ff', // Match register page background
                color: '#6366f1',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                boxShadow: 'none'
              }}
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
            </button>
          </div>
        </div>
        {/* Login Button */}
        <button
          type="submit"
          className="btn w-100 fw-bold mb-2"
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 2px 12px #6366f133',
            letterSpacing: '0.5px'
          }}
          disabled={loading}
        >
          <span role="img" aria-label="login" style={{ marginRight: 8 }}>🔑</span>
          {loading ? (
            <>
              Logging in
              <span
                style={{
                  display: 'inline-block',
                  minWidth: 16,
                  fontWeight: 900,
                  letterSpacing: 1,
                  animation: 'fadeDots 1.2s linear infinite'
                }}
              >
                {dots}
              </span>
            </>
          ) : 'Login'}
        </button>
        {/* Add keyframes for fadeDots animation */}
        <style>
          {`
            @keyframes fadeDots {
              0% { opacity: 1; }
              50% { opacity: 0.6; }
              100% { opacity: 1; }
            }
          `}
        </style>
        {/* Register Link */}
        <div className="text-center mt-2" style={{ fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}