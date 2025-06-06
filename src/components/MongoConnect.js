import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MongoConnect({ user }) {
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  // Get country and timezone
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setCountry(data.country_name || 'Unknown');
        setTimezone(data.timezone || 'Unknown');
        setLocalTime(new Date().toLocaleTimeString('en-US', { timeZone: data.timezone }));
      })
      .catch(() => {
        setCountry('Unknown');
        setTimezone('Unknown');
        setLocalTime(new Date().toLocaleTimeString());
      });
  }, []);

  // Helper to get greeting
  function getGreeting(hours) {
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }

  if (!user) {
    return <div>Please log in (login form coming soon)</div>;
  }

  const hours = new Date().getHours();
  const greeting = getGreeting(hours);
  const joinedDate = new Date(user.joined).toLocaleDateString();
  const initials = user.username
    ? user.username.split(' ').map(n => n[0]).join('').toUpperCase()
    : '';

  const iconStyle = { fontSize: 22, marginRight: sidebarOpen ? 16 : 0, color: '#fff' };
  const cardMaxWidth = sidebarOpen ? 600 : 900;
  const cardTransition = 'max-width 0.2s';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#fff5ed',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 70,
        background: '#262626',
        boxShadow: '2px 0 12px #0002',
        display: 'flex',
        flexDirection: 'column',
        alignItems: sidebarOpen ? 'center' : 'flex-start',
        padding: sidebarOpen ? '2.5rem 1rem 1rem 1rem' : '2.5rem 0.5rem 1rem 0.5rem',
        minHeight: '100vh',
        transition: 'width 0.2s'
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 26,
            cursor: 'pointer',
            alignSelf: sidebarOpen ? 'flex-end' : 'center',
            marginBottom: sidebarOpen ? 30 : 20,
            marginRight: sidebarOpen ? 0 : 0
          }}
          aria-label="Toggle sidebar"
        >
          <span role="img" aria-label="menu">☰</span>
        </button>
        {/* Profile */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff7e5f 60%, #feb47b 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: '#fff', fontWeight: 700, marginBottom: sidebarOpen ? 18 : 10,
          boxShadow: '0 4px 16px #0003'
        }}>
          {initials}
        </div>
        {sidebarOpen && (
          <>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4, color: '#fff', textAlign: 'center' }}>
              {user.username}
            </div>
            <div style={{ color: '#ffd6b0', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
              <span role="img" aria-label="calendar">📅</span> Joined: {joinedDate}
            </div>
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 6 }}>
              <span role="img" aria-label="clock">⏰</span> {localTime}
            </div>
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 6 }}>
              <span role="img" aria-label="globe">🌍</span> {country}
            </div>
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 18 }}>
              <span role="img" aria-label="timezone">🕑</span> {timezone}
            </div>
          </>
        )}
        {/* Sidebar links */}
        <nav style={{ width: '100%' }}>
          <a
            href="https://your-documentation-link.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 500,
              background: sidebarOpen ? '#ff7e5f' : 'none',
              borderRadius: 6,
              padding: sidebarOpen ? '10px 18px' : '10px',
              marginBottom: 10,
              marginLeft: sidebarOpen ? 0 : 2,
              transition: 'background 0.2s'
            }}
          >
            <span style={iconStyle} role="img" aria-label="docs">📖</span>
            {sidebarOpen && "Documentation"}
          </a>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              fontWeight: 500,
              borderRadius: 6,
              padding: sidebarOpen ? '10px 18px' : '10px',
              marginLeft: sidebarOpen ? 0 : 2,
              cursor: 'pointer'
            }}
          >
            <span style={iconStyle} role="img" aria-label="profile">👤</span>
            {sidebarOpen && "Profile"}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{
          height: 64,
          background: '#ff7e5f', // DIFFERENT from sidebar
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          boxShadow: '0 2px 8px #0001'
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, display: 'flex', alignItems: 'center' }}>
            <span role="img" aria-label="logo" style={{ fontSize: 28, marginRight: 10 }}>🗄️</span>
            ZackDB
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login'; // or use navigate('/login');
            }}
            style={{
              background: '#262626',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0001',
              transition: 'background 0.2s'
            }}
          >
            <span role="img" aria-label="logout" style={{ marginRight: 6 }}>🚪</span>
            Logout
          </button>
        </header>

        {/* Dashboard content */}
        <main style={{
          flex: 1,
          padding: '2.5rem 3rem',
          background: '#fff5ed',
          transition: 'padding 0.2s'
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
            color: '#262626'
          }}>
            {greeting}, <span style={{ color: '#ff7e5f' }}>{user.username.split(' ')[0]}!</span>
          </div>
          <div style={{
            fontSize: 18,
            color: '#262626',
            marginBottom: 32
          }}>
            Welcome to your dashboard. Here you can manage your saved MongoDB connection strings or add new ones.
          </div>
        </main>
      </div>
    </div>
  );
}
