import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://zackdbbackend.onrender.com';

function isValidMongoAtlasConnectionString(str) {
  return typeof str === 'string' && str.startsWith('mongodb+srv://');
}

function getClusterName(connectionString) {
  // Example: extract cluster name from MongoDB URI
  try {
    const match = connectionString.match(/\/\/([^./]+)/);
    return match ? match[1] : 'Unknown Cluster';
  } catch {
    return 'Unknown Cluster';
  }
}

// Add this before your Dashboard function
const HamburgerIcon = ({ open, ...props }) => (
  <span {...props} style={{ fontSize: 28, cursor: 'pointer', userSelect: 'none' }}>
    {open ? '☰' : '≡'}
  </span>
);

function Sidebar({ user, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    fetch(`${API_URL}/api/logout`, { credentials: 'include' }).finally(() => {
      navigate('/login');
    });
  };

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  const sidebarStyle = {
    width: sidebarOpen ? 270 : 72,
    minWidth: 0,
    maxWidth: 270,
    height: '100vh',
    background: 'linear-gradient(120deg, #6366f1 0%, #818cf8 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: sidebarOpen ? 'flex-start' : 'center',
    padding: sidebarOpen ? '38px 0 0 0' : '22px 0 0 0',
    transition: 'width 0.55s cubic-bezier(.4,1.6,.6,1), box-shadow 0.55s cubic-bezier(.4,1.6,.6,1)',
    position: 'relative',
    zIndex: 11,
    boxShadow: '0 0 32px 0 rgba(99,102,241,0.13), 0 2px 12px #818cf855',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
  };

  return (
    <div style={sidebarStyle}>
      {/* Collapse/Expand Button */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-end' : 'center',
          padding: sidebarOpen ? '0 20px 0 0' : '0',
          marginBottom: 44,
          marginTop: 36
        }}
      >
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            fontSize: 26,
            cursor: 'pointer',
            userSelect: 'none',
            color: '#6366f1',
            padding: '10px 16px',
            borderRadius: 24,
            border: 'none',
            background: '#fff',
            boxShadow: '0 2px 16px #6366f144, 0 0 0 2px #818cf855',
            transition: 'background 0.22s, box-shadow 0.22s',
            outline: 'none',
            fontWeight: 700,
            filter: 'drop-shadow(0 2px 8px #818cf855)',
            position: 'relative'
          }}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onMouseOver={e => e.currentTarget.style.background = '#f1f5ff'}
          onMouseOut={e => e.currentTarget.style.background = '#fff'}
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>

      {/* User Section */}
      <div
        style={{
          width: '100%',
          padding: sidebarOpen ? '0 0 0 18px' : '0', // Keep left padding for all content
          marginBottom: 38,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Always center horizontally
          justifyContent: 'center',
        }}
      >
        {/* Avatar with white ring */}
        <div
          style={{
            width: sidebarOpen ? 88 : 40,
            height: sidebarOpen ? 88 : 40,
            borderRadius: '50%',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: sidebarOpen ? 22 : 10,
            boxShadow: '0 0 0 4px #fff',
            border: 'none',
            position: 'relative',
            transition: 'all 0.55s cubic-bezier(.4,1.6,.6,1)'
          }}
        >
          <span
            role="img"
            aria-label="user on laptop"
            style={{
              fontSize: sidebarOpen ? 56 : 24,
              display: 'block',
              color: '#fff',
              filter: 'drop-shadow(0 2px 8px #6366f199)',
              transition: 'font-size 0.55s cubic-bezier(.4,1.6,.6,1)'
            }}
          >🧑‍💻</span>
        </div>
        {sidebarOpen && (
          <>
            <div style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: 24,
              marginBottom: 6,
              letterSpacing: '0.3px',
              textAlign: 'center',
              width: '100%',
              textShadow: '0 2px 12px #6366f155',
              display: 'flex',
              justifyContent: 'center' // Center username
            }}>
              {user?.username || 'User'}
            </div>
            <div style={{
              color: '#fff',
              fontSize: 17,
              fontWeight: 600,
              marginBottom: 10,
              textAlign: 'center',
              width: '100%',
              opacity: 0.96,
              letterSpacing: '0.2px',
              textShadow: '0 1px 8px #6366f122',
              display: 'flex',
              justifyContent: 'center', // Center email horizontally
              alignItems: 'center'
            }}>
              {user?.email || ''}
            </div>
          </>
        )}
        {sidebarOpen && (
          <div style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 500,
            marginTop: 18,
            marginBottom: 10,
            opacity: 0.98,
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: 210,
            alignSelf: 'center',
            letterSpacing: '0.13px',
            textShadow: '0 1px 8px #6366f122',
            wordBreak: 'break-word',
            display: 'flex',
            justifyContent: 'center'
          }}>
            Save and visualize your MongoDB databases with ease.
          </div>
        )}
        {/* zackdb © YEAR */}
        {sidebarOpen && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center', // Center horizontally
            gap: 6,
            margin: '10px 0 0 0',
            fontSize: 15,
            color: '#fff',
            opacity: 0.75,
            fontWeight: 600,
            letterSpacing: '0.1em',
            userSelect: 'none'
          }}>
            <span style={{ fontWeight: 700 }}>zackdb</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              color: '#6366f1',
              fontWeight: 900,
              fontSize: 13,
              marginLeft: 2,
              marginRight: 2,
              boxShadow: '0 1px 4px #6366f122'
            }}>©</span>
            <span>{currentYear}</span>
          </div>
        )}
      </div>

      {/* Spacer to push logout to bottom */}
      <div style={{ flex: 1 }} />

      {/* Logout Button */}
      <div style={{
        width: '100%',
        padding: sidebarOpen ? '0 0 70px 0' : '0 0 38px 0', // Move logout button up from bottom when expanded
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleLogout}
          style={{
            minWidth: 0,
            width: sidebarOpen ? 120 : 44,
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 22,
            padding: sidebarOpen ? '12px 0' : '12px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 16px #6366f144, 0 0 0 2px #818cf855',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sidebarOpen ? 10 : 0,
            letterSpacing: '0.5px',
            transition: 'width 0.22s, background 0.22s, border-radius 0.22s',
            outline: 'none'
          }}
          title="Logout"
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)'}
        >
          <span role="img" aria-label="logout" style={{ marginRight: sidebarOpen ? 8 : 0, fontSize: 20 }}>🔒</span>
          {sidebarOpen && 'Logout'}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [loading, setLoading] = useState(!user); // loading depends on user prop
  const [input, setInput] = useState('');
  const [savedConnections, setSavedConnections] = useState([]);
  const [error, setError] = useState('');
  const errorTimeoutRef = useRef();
  const navigate = useNavigate();

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setError(''), 3000);
    }
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [error]);

  const [connPage, setConnPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null); // holds the connection string to confirm
  const deleteBtnRefs = useRef({});
  const connectionsPerPage = 5;

  useEffect(() => {
    if (!user) {
      setLoading(true);
      fetch(`${API_URL}/api/me`, {
        credentials: 'include'
      })
        .then(async res => {
          if (!res.ok) throw new Error('Not authenticated');
          const data = await res.json();
          // setUser(data.user); // REMOVE this line
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          navigate('/login', { replace: true });
        });
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch(`${API_URL}/api/saved-connections`, {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login');
        } else {
          return res.json();
        }
      })
      .then(data => {
        if (data) setSavedConnections(data);
      });
  }, [navigate]);

  const totalConnPages = Math.ceil(savedConnections.length / connectionsPerPage);
  const paginatedConnections = savedConnections.slice(
    (connPage - 1) * connectionsPerPage,
    connPage * connectionsPerPage
  );

  const handleConnect = async (connStr) => {
    setError('');
    if (!connStr) {
      setError('Please enter a connection string.');
      return;
    }
    if (!isValidMongoAtlasConnectionString(connStr)) {
      setError('Please enter a valid MongoDB Atlas connection string.');
      return;
    }
    const name = getClusterName(connStr);
    try {
      const res = await fetch(`${API_URL}/api/saved-connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ connectionString: connStr, clusterName: name })
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        setError(data.message || 'Connection string already exists, check saved connections list');
        return;
      }

      // Refresh saved connections after successful save
      const connectionsRes = await fetch(`${API_URL}/api/saved-connections`, {
        credentials: 'include'
      });
      const connectionsData = await connectionsRes.json();
      setSavedConnections(connectionsData);

      setInput('');
      setError('');

      await handleUseConnection(connStr);

    } catch (err) {
      setError(err.message || 'Failed to save connection string.');
    }
  };

  const handleUseConnection = async (connStr) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/list-databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: connStr })
      });
      const dbs = await res.json();
      navigate('/explore', { state: { connectionString: connStr, databases: dbs } }); // <-- Corrected line
    } catch {
      setError('Failed to fetch databases.');
    }
  };

  const handleDeleteConnection = async (connectionString) => {
    setError('');
    try {
      await fetch(`${API_URL}/api/saved-connections/${encodeURIComponent(connectionString)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      // Refresh saved connections after delete
      const connectionsRes = await fetch(`${API_URL}/api/saved-connections`, {
        credentials: 'include'
      });
      const connectionsData = await connectionsRes.json();
      setSavedConnections(connectionsData);
    } catch (err) {
      setError('Failed to delete connection.');
    }
  };

  // Layout constants
  const HEADER_HEIGHT = 64;
  const SIDEBAR_WIDTH = 260;
  const SIDEBAR_COLLAPSED = 64;
  const PADDING_X = 32;

  // Ultra modern colors and glassmorphism
  const glass = {
    background: 'rgba(255,255,255,0.72)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    border: '1.5px solid rgba(200,200,255,0.13)'
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: '#6366f1'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
      display: 'flex',
      flexDirection: 'row',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      {/* Sidebar */}
      <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Main content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 2px 16px #6366f122',
          height: HEADER_HEIGHT,
          minHeight: HEADER_HEIGHT,
          maxHeight: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 120px 0 48px', // Increased right padding to move logout button left
          position: 'sticky',
          top: 0,
          zIndex: 10,
          flexShrink: 0,
          borderBottom: '1.5px solid #e0e7ff'
        }}>
          <div style={{
            fontWeight: 900,
            fontSize: 26,
            color: 'transparent',
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text'
          }}>
            <span role="img" aria-label="rocket" style={{ fontSize: 30 }}>🚀</span> zackdb
          </div>
          {/* PC view: Logout button on right side of header */}
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 0 }}>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                fetch(`${API_URL}/api/logout`, { credentials: 'include' }).finally(() => {
                  navigate('/login');
                });
              }}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 22,
                padding: '10px 28px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 16px #6366f144, 0 0 0 2px #818cf855',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                letterSpacing: '0.5px',
                transition: 'background 0.22s, box-shadow 0.22s, border-radius 0.22s',
                outline: 'none'
              }}
              title="Logout"
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)'}
            >
              <span role="img" aria-label="logout" style={{ fontSize: 20 }}>🔒</span>
              Logout
            </button>
          </div>
        </div>
        {/* Main horizontal layout */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(120deg, #f1f5f9 0%, #e0e7ff 100%)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 980,
            display: 'flex',
            flexDirection: 'row',
            gap: 40,
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            {/* Left: New Connection */}
            <div style={{
              ...glass,
              flex: 1,
              borderRadius: 22,
              padding: '44px 36px 36px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 320,
              maxWidth: 440,
              marginTop: 12
            }}>
              <div style={{
                fontSize: 54,
                marginBottom: 12,
                lineHeight: 1,
                color: 'transparent',
                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}>
                <span role="img" aria-label="rocket">🚀</span>
              </div>
              <h1 style={{
                color: 'transparent',
                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                fontWeight: 900,
                fontSize: 30,
                letterSpacing: '-1px',
                marginBottom: 10
              }}>
                Welcome{user ? `, ${user.username}` : ''}!
              </h1>
              <div style={{
                color: '#23272f',
                fontSize: 18,
                marginBottom: 28,
                fontWeight: 500,
                textAlign: 'center',
                opacity: 0.85
              }}>
                Connect to your MongoDB database to get started.
              </div>
              <input
                type="text"
                placeholder="Paste your MongoDB connection string here"
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 340,
                  padding: '16px 22px',
                  fontSize: 17,
                  borderRadius: 10,
                  border: '1.5px solid #6366f1',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.85)',
                  color: '#23272f',
                  marginBottom: 20,
                  boxShadow: '0 2px 12px #6366f122',
                  transition: 'border 0.2s'
                }}
              />
              <button
                onClick={() => handleConnect(input)}
                style={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 36px',
                  fontWeight: 800,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px #6366f133',
                  marginBottom: 6,
                  letterSpacing: '0.5px',
                  transition: 'background 0.2s'
                }}
                disabled={!input}
              >
                <span role="img" aria-label="rocket" style={{ marginRight: 8 }}>🚀</span>
                Save & Connect
              </button>
              {error && (
                <div style={{
                  color: '#6366f1',
                  background: 'none',
                  border: 'none',
                  borderRadius: 0,
                  padding: 0,
                  marginTop: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  textAlign: 'center',
                  transition: 'opacity 0.3s'
                }}>
                  {error}
                </div>
              )}
            </div>
            {/* Right: Saved Connections */}
            <div
              className="saved-connections-card"
              style={{
                ...glass,
                flex: 1,
                borderRadius: 22,
                padding: '44px 36px 36px 36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 320,
                maxWidth: 440,
                marginTop: 12,
                position: 'relative', // Needed for absolute modal/backdrop
                overflow: 'visible'
              }}
            >
              <div style={{
                fontSize: 26,
                fontWeight: 800,
                marginBottom: 18,
                color: 'transparent',
                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}>
                Saved Connections
              </div>
              {paginatedConnections.length === 0 ? (
                <div style={{ color: '#888', fontSize: 16, marginTop: 24 }}>No saved connections yet.</div>
              ) : (
                <ul style={{ width: '100%', padding: 0, margin: 0, listStyle: 'none' }}>
                  {paginatedConnections.map((conn, idx) => (
                    <li key={conn.connectionString} style={{
                      background: 'rgba(245,245,255,0.88)',
                      borderRadius: 12,
                      marginBottom: 14,
                      padding: '18px 16px',
                      boxShadow: '0 2px 8px #6366f111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10
                    }}>
                      <div>
                        {/* Cluster name with theme gradient */}
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 17,
                            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                            color: '#fff',
                            padding: '4px 16px',
                            borderRadius: 8,
                            display: 'inline-block',
                            boxShadow: '0 2px 8px #6366f122',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {conn.clusterName || getClusterName(conn.connectionString)}
                        </div>
                        {/* Optionally, remove or hide the connection string */}
                        {/* <div style={{ fontSize: 14, color: '#6366f1', wordBreak: 'break-all', opacity: 0.85 }}>
                          {conn.connectionString}
                        </div> */}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleUseConnection(conn.connectionString)}
                          style={{
                            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '7px 18px',
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px #6366f122'
                          }}
                        >
                          Use
                        </button>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="delete"
                          title="Delete"
                          ref={el => deleteBtnRefs.current[conn.connectionString] = el}
                          onClick={() => setConfirmDelete(conn.connectionString)}
                          onKeyPress={e => {
                            if (e.key === 'Enter' || e.key === ' ') setConfirmDelete(conn.connectionString);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            fontSize: 22,
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            userSelect: 'none',
                            padding: 0,
                            margin: 0
                          }}
                        >
                          🗑️
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Pagination */}
              {totalConnPages > 1 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    onClick={() => setConnPage(p => Math.max(1, p - 1))}
                    disabled={connPage === 1}
                    style={{
                      background: '#e0e7ff',
                      color: '#6366f1',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: connPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Prev
                  </button>
                  <span style={{ fontWeight: 700, color: '#6366f1', fontSize: 15 }}>
                    {connPage} / {totalConnPages}
                  </span>
                  <button
                    onClick={() => setConnPage(p => Math.min(totalConnPages, p + 1))}
                    disabled={connPage === totalConnPages}
                    style={{
                      background: '#e0e7ff',
                      color: '#6366f1',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: connPage === totalConnPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Modal Backdrop and Modal (inside the card, absolutely  positioned) */}
              {confirmDelete && (
                <>
                  {/* Backdrop */}
                  <div
                    className="modal-backdrop"
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(44, 62, 80, 0.18)',
                      zIndex: 20,
                      borderRadius: 22
                    }}
                  />
                  {/* Modal */}
                  <div
                    className="modal"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      minWidth: 280,
                      maxWidth: 340,
                      background: '#fff',
                      borderRadius: 16,
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                      zIndex: 21,
                      padding: '32px 22px 22px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, color: '#6366f1' }}>
                      Confirm Delete
                    </div>
                    <div style={{ color: '#23272f', fontSize: 15, marginBottom: 26, textAlign: 'center' }}>
                      Are you sure you want to delete this connection?
                    </div>
                    <div style={{ display: 'flex', gap: 18 }}>
                      <button
                        onClick={() => {
                          handleDeleteConnection(confirmDelete);
                          setConfirmDelete(null);
                        }}
                        style={{
                          background: '#f87171',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 22px',
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          background: '#e0e7ff',
                          color: '#6366f1',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 22px',
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
