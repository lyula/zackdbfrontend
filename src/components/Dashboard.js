import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const HamburgerIcon = ({ open, ...props }) => (
  <span {...props} style={{ cursor: 'pointer', fontSize: 28, marginRight: 18, ...props.style }}>
    {open ? (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <line x1="7" y1="7" x2="21" y2="21" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
        <line x1="21" y1="7" x2="7" y2="21" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ) : (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <rect x="5" y="8" width="18" height="3" rx="1.5" fill="#6366f1"/>
        <rect x="5" y="13" width="18" height="3" rx="1.5" fill="#6366f1"/>
        <rect x="5" y="18" width="18" height="3" rx="1.5" fill="#6366f1"/>
      </svg>
    )}
  </span>
);

export default function Dashboard({ user }) {
  const [input, setInput] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [savedConnections, setSavedConnections] = useState([]);
  const [error, setError] = useState('');
  const [connPage, setConnPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null); // holds the connection string to confirm
  const connectionsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      navigate('/login');
    }
  }, [navigate, user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/saved-connections`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSavedConnections(data));
  }, []);

  const totalConnPages = Math.ceil(savedConnections.length / connectionsPerPage);
  const paginatedConnections = savedConnections.slice(
    (connPage - 1) * connectionsPerPage,
    connPage * connectionsPerPage
  );

  const handleConnect = async (connStr, name) => {
    setError('');
    if (!connStr || !name) {
      setError('Please enter both a cluster name and connection string.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/saved-connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ connectionString: connStr, clusterName: name })
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // If response is not JSON, keep data as empty object
      }

      if (!res.ok) {
        setError(data.message || 'Connection string already exists, check saved connections list');
        return;
      }

      // Refresh saved connections after successful save
      const token = localStorage.getItem('token');
      const connectionsRes = await fetch(`${API_URL}/api/saved-connections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const connectionsData = await connectionsRes.json();
      setSavedConnections(connectionsData);

      // Optionally clear input fields
      setInput('');
      setClusterName('');
      setError('');

      // Redirect to explore page with databases
      await handleUseConnection(connStr);

    } catch (err) {
      setError(err.message || 'Failed to save Connection string already exists, check saved connections listconnection string.');
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
      navigate('/explore', { state: { connectionString: connStr, databases: dbs } });
    } catch {
      setError('Failed to fetch databases.');
    }
  };

  const handleDeleteConnection = async (connectionString) => {
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${API_URL}/api/saved-connections/${encodeURIComponent(connectionString)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to delete connection.');
        return;
      }
      // Refresh saved connections after delete
      const connectionsRes = await fetch(`${API_URL}/api/saved-connections`, {
        headers: { Authorization: `Bearer ${token}` }
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
      <div style={{
        width: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED,
        minWidth: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED,
        maxWidth: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED,
        height: '100vh',
        background: 'linear-gradient(160deg, #6366f1 60%, #818cf8 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: sidebarOpen ? '48px 0 0 0' : '24px 0 0 0',
        boxSizing: 'border-box',
        gap: sidebarOpen ? 22 : 0,
        borderRight: '1.5px solid #e0e7ff',
        position: 'relative',
        zIndex: 2,
        transition: 'all 0.2s cubic-bezier(.4,2,.6,1)'
      }}>
        {/* Hamburger menu */}
        <HamburgerIcon
          open={sidebarOpen}
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            alignSelf: 'flex-start',
            marginLeft: sidebarOpen ? 18 : 10,
            marginBottom: sidebarOpen ? 18 : 0,
            marginTop: 0
          }}
        />
        {sidebarOpen && (
          <>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              color: '#fff',
              marginBottom: 18,
              border: '4px solid #fff2',
              boxShadow: '0 2px 16px #6366f144'
            }}>
              <span role="img" aria-label="avatar">🧑‍💻</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 2, color: '#fff' }}>
              {user?.username}
            </div>
            <div style={{ color: '#e0e7ff', fontWeight: 500, fontSize: 15, marginBottom: 4 }}>
              {user?.email}
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 12, opacity: 0.85 }}>
              MongoDB Enthusiast
            </div>
            <div style={{ color: '#fff', fontSize: 14, textAlign: 'center', opacity: 0.7, marginTop: 10 }}>
              <span style={{ fontWeight: 400 }}>Save and visualize your database connections with ease.</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ color: '#e0e7ff', fontSize: 13, opacity: 0.7, marginBottom: 18 }}>
              <span>zackdb &copy; 2025</span>
            </div>
          </>
        )}
        {/* Logout button always visible, moves left when collapsed */}
        <button
          onClick={() => {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            navigate('/login');
          }}
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 22,
            padding: sidebarOpen ? '10px 32px' : '10px 12px',
            fontWeight: 800,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #6366f133',
            transition: 'all 0.2s',
            marginBottom: sidebarOpen ? 24 : 0,
            marginLeft: sidebarOpen ? 0 : 0,
            alignSelf: sidebarOpen ? 'center' : 'flex-start'
          }}
          title="Logout"
        >
          <span role="img" aria-label="logout" style={{ marginRight: sidebarOpen ? 8 : 0 }}>🔒</span>
          {sidebarOpen && 'Logout'}
        </button>
      </div>

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
          padding: '0 32px 0 48px',
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
                placeholder="Cluster Name"
                value={clusterName}
                onChange={e => setClusterName(e.target.value)}
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
                  marginBottom: 12,
                  boxShadow: '0 2px 12px #6366f122',
                  transition: 'border 0.2s'
                }}
              />
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
                onClick={() => handleConnect(input, clusterName)}
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
                disabled={!input || !clusterName}
              >
                <span role="img" aria-label="rocket" style={{ marginRight: 8 }}>🚀</span>
                Save & Connect
              </button>
              {error && <div style={{ color: '#6366f1', marginTop: 14, fontWeight: 600 }}>{error}</div>}
            </div>

            {/* Right: Saved Connections */}
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
              <h3 style={{
                color: 'transparent',
                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                marginBottom: 22,
                fontWeight: 900,
                fontSize: 24,
                letterSpacing: '-0.5px'
              }}>Saved Connections</h3>
              <ul style={{
                paddingLeft: 0,
                listStyle: 'none',
                marginBottom: 22,
                width: '100%',
                maxHeight: 260,
                overflowY: 'auto'
              }}>
                {paginatedConnections.length === 0 && (
                  <li style={{ color: '#6366f1', textAlign: 'center', padding: '14px 0' }}>No saved connections yet.</li>
                )}
                {paginatedConnections.filter(Boolean).map((conn, idx) => (
                  <li key={conn._id || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 10,
                    background: 'rgba(236,239,255,0.85)',
                    borderRadius: 8,
                    padding: '10px 14px'
                  }}>
                    <span style={{
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'inline-block',
                      fontSize: 16,
                      color: '#23272f',
                      fontWeight: 700
                    }}>{conn.clusterName || 'Unnamed Cluster'}</span>
                    <button
                      style={{
                        marginLeft: 14,
                        background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px 22px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px #6366f133',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => handleUseConnection(conn.connectionString)}
                    >
                      <span role="img" aria-label="rocket" style={{ marginRight: 7 }}>🚀</span>
                      Use
                    </button>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        style={{
                          marginLeft: 8,
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: 20,
                          cursor: 'pointer'
                        }}
                        title="Delete"
                        onClick={() => setConfirmDelete(conn.connectionString)}
                      >
                        🗑️
                      </button>
                      {confirmDelete === conn.connectionString && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '120%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#fff',
                            color: '#23272f',
                            padding: '22px 24px 18px 24px',
                            borderRadius: 14,
                            boxShadow: '0 4px 24px 0 rgba(99,102,241,0.13)',
                            zIndex: 100,
                            minWidth: 240,
                            textAlign: 'center',
                            border: '1.5px solid #e0e7ff'
                          }}
                        >
                          <div style={{ marginBottom: 14, fontWeight: 700, fontSize: 17 }}>
                            Delete this connection?
                          </div>
                          <div style={{ marginBottom: 18, color: '#6366f1', fontSize: 14 }}>
                            Are you sure you want to delete this connection?
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                            <button
                              style={{
                                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 22px',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                handleDeleteConnection(conn.connectionString);
                                setConfirmDelete(null);
                              }}
                            >
                              Delete
                            </button>
                            <button
                              style={{
                                background: '#fff',
                                color: '#6366f1',
                                border: '2px solid #6366f1',
                                borderRadius: 8,
                                padding: '8px 22px',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer'
                              }}
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {/* Pagination Controls */}
              {totalConnPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                  <button
                    onClick={() => setConnPage(p => Math.max(1, p - 1))}
                    disabled={connPage === 1}
                    style={{
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 18px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: connPage === 1 ? 'not-allowed' : 'pointer',
                      marginRight: 10,
                      opacity: connPage === 1 ? 0.5 : 1
                    }}
                  >Prev</button>
                  <span style={{ fontSize: 15, color: '#6366f1', fontWeight: 700 }}>
                    {connPage}/{totalConnPages}
                  </span>
                  <button
                    onClick={() => setConnPage(p => Math.min(totalConnPages, p + 1))}
                    disabled={connPage === totalConnPages}
                    style={{
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 18px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: connPage === totalConnPages ? 'not-allowed' : 'pointer',
                      marginLeft: 10,
                      opacity: connPage === totalConnPages ? 0.5 : 1
                    }}
                  >Next</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}