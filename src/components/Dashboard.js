import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'https://zackdbbackend.onrender.com';

function isValidMongoAtlasConnectionString(str) {
  return typeof str === 'string' && str.startsWith('mongodb+srv://');
}

function getClusterName(connectionString) {
  const match = connectionString.match(/@([^\.]+)/);
  return match ? match[1] : 'Unknown Cluster';
}

// Update truncateName to always add ... at the 11th character if needed
function truncateName(name, maxLength = 10) {
  if (name.length > maxLength) {
    return name.slice(0, maxLength) + '...';
  }
  return name;
}

// Utility to get shortest word from a name string
function getShortestName(name) {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0];
  // Return the shortest word
  return words.reduce((shortest, word) =>
    word.length < shortest.length ? word : shortest
  );
}

// Hamburger icon for mobile header (white color for both states)
const HamburgerIcon = ({ open, ...props }) => (
  <span
    {...props}
    style={{
      fontSize: 28,
      cursor: 'pointer',
      userSelect: 'none',
      marginRight: 18,
      color: '#fff', // Always white
      transition: 'color 0.2s'
    }}
  >
    {open ? '✕' : '☰'}
  </span>
);

function Sidebar({ user, sidebarOpen, setSidebarOpen, isMobile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    fetch(`${API_URL}/api/logout`, { credentials: 'include' }).finally(() => {
      navigate('/login');
    });
  };

  const currentYear = new Date().getFullYear();

  // Custom sidebar gradient and white text, no Bootstrap bg classes
  const sidebarStyles = {
    width: isMobile ? 270 : (sidebarOpen ? 270 : 72),
    minWidth: 0,
    maxWidth: 270,
    height: '100vh',
    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', // Match mobile header
    boxShadow: '0 0 32px 0 rgba(99,102,241,0.13), 0 2px 12px #818cf855',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 200,
    transition: 'width 0.45s cubic-bezier(.4,1.6,.6,1), box-shadow 0.3s',
    overflow: 'hidden',
    position: isMobile ? 'fixed' : 'static',
    top: 0,
    left: 0,
    display: isMobile ? (sidebarOpen ? 'flex' : 'none') : 'flex',
    flexDirection: 'column',
    color: '#fff',
  };

  return (
    <nav
      className="d-flex flex-column"
      style={sidebarStyles}
    >
      {/* Collapse/Expand Button */}
      {!isMobile && (
        <div className="d-flex justify-content-end align-items-center mt-4 mb-4 px-3">
          <button
            className="btn btn-light shadow-sm fw-bold"
            style={{
              fontSize: 26,
              borderRadius: 24,
              color: '#6366f1',
              background: '#fff'
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={() => setSidebarOpen(o => !o)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
      )}

      {/* User Section */}
      <div
        className="d-flex flex-column align-items-center mb-4 px-2"
        style={
          isMobile
            ? { marginTop: 120 } // Move user profile further down on mobile
            : {}
        }
      >
        <div
          className="d-flex align-items-center justify-content-center mb-2"
          style={{
            width: sidebarOpen ? 88 : 40,
            height: sidebarOpen ? 88 : 40,
            borderRadius: '50%',
            boxShadow: '0 0 0 4px #fff',
            background: 'transparent'
          }}
        >
          <span role="img" aria-label="user on laptop" style={{ fontSize: sidebarOpen ? 56 : 24, color: '#fff' }}>🧑‍💻</span>
        </div>
        {sidebarOpen && (
          <>
            <div className="fw-bold fs-4 text-center mb-1" style={{ textShadow: '0 2px 12px #6366f155', color: '#fff' }}>
              {user?.username || user?.email || 'User'}
            </div>
            <div className="fs-6 fw-semibold mb-2 text-center" style={{ opacity: 0.96, textShadow: '0 1px 8px #6366f122', color: '#fff' }}>
              {user?.email || ''}
            </div>
            <div className="fs-6 fw-normal mb-2 text-center" style={{ opacity: 0.98, textShadow: '0 1px 8px #6366f122', color: '#fff' }}>
              Save and visualize your MongoDB databases with ease.
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2 opacity-75 fw-semibold mt-2" style={{ letterSpacing: '0.1em', color: '#fff' }}>
              <span className="fw-bold">zackdb</span>
              <span className="bg-white text-primary rounded-circle px-2 py-1 fw-bold" style={{ fontSize: 13 }}>©</span>
              <span>{currentYear}</span>
            </div>
          </>
        )}
      </div>
      <div className="flex-grow-1" />
      {/* Logout Button */}
      <div
        className="d-flex justify-content-center mb-4"
        style={
          isMobile
            ? { marginBottom: 48, marginTop: 0, paddingBottom: 8 } // Move logout button up on mobile
            : {}
        }
      >
        <button
          className="btn fw-bold d-flex align-items-center gap-2"
          style={{
            width: sidebarOpen ? 120 : 44,
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', // Match mobile header
            color: '#fff',
            borderRadius: 22,
            fontSize: 16,
            boxShadow: '0 2px 16px #6366f144, 0 0 0 2px #818cf855'
          }}
          onClick={handleLogout}
          title="Logout"
        >
          <span role="img" aria-label="logout" style={{ fontSize: 20 }}>🔒</span>
          {sidebarOpen && 'Logout'}
        </button>
      </div>
    </nav>
  );
}

function MobileHeader({ navigate, sidebarOpen, setSidebarOpen }) {
  return (
    <header className="d-flex align-items-center justify-content-between px-2 py-2 sticky-top shadow-sm"
      style={{
        background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
        height: 56,
        zIndex: 101
      }}>
      <div className="d-flex align-items-center">
        <HamburgerIcon open={sidebarOpen} onClick={() => setSidebarOpen(o => !o)} />
      </div>
      <div className="fw-bold fs-4 text-white d-flex align-items-center gap-2" style={{ textShadow: '0 2px 12px #6366f155' }}>
        <span role="img" aria-label="rocket" style={{ fontSize: 24 }}>🚀</span> zackdb
      </div>
      <button
        className="btn btn-light rounded-pill d-flex align-items-center"
        style={{ color: '#6366f1', marginLeft: 8 }}
        onClick={() => {
          localStorage.removeItem('token');
          fetch(`${API_URL}/api/logout`, { credentials: 'include' }).finally(() => {
            navigate('/login');
          });
        }}
        title="Logout"
      >
        <span role="img" aria-label="logout" style={{ fontSize: 18 }}>🔒</span>
      </button>
    </header>
  );
}

export default function Dashboard({ user: userProp }) {
  const [user, setUser] = useState(userProp || null);
  const [loading, setLoading] = useState(!user);
  const [input, setInput] = useState('');
  const [savedConnections, setSavedConnections] = useState([]);
  const [error, setError] = useState('');
  const errorTimeoutRef = useRef();
  const navigate = useNavigate();

  const [connPage, setConnPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const deleteBtnRefs = useRef({});
  const connectionsPerPage = 5;

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Sidebar: hidden by default on mobile, collapsed by default on desktop
  const [sidebarOpen, setSidebarOpen] = useState(isMobile ? false : false);

  useEffect(() => {
    setSidebarOpen(isMobile ? false : false); // Always hidden by default on mobile, collapsed on desktop
  }, [isMobile]);

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

  useEffect(() => {
    if (!user) {
      setLoading(true);
      fetch(`${API_URL}/api/me`, {
        credentials: 'include'
      })
        .then(async res => {
          if (!res.ok) throw new Error('Not authenticated');
          const data = await res.json();
          setUser(data.user); // <-- UNCOMMENT THIS LINE
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
        if (Array.isArray(data)) setSavedConnections(data);
      });
  }, [navigate]);

  // After fetching savedConnections and before rendering the Saved Connections list:
  const isConnectionsArray = Array.isArray(savedConnections);
  const safeConnections = isConnectionsArray ? savedConnections : [];
  const totalConnPages = Math.ceil(safeConnections.length / connectionsPerPage);
  const paginatedConnections = safeConnections.slice(
    (connPage - 1) * connectionsPerPage,
    connPage * connectionsPerPage
  );

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveDots, setSaveDots] = useState(0);

  // Animate dots for "Saving..."
  useEffect(() => {
    let interval;
    if (saveLoading) {
      interval = setInterval(() => {
        setSaveDots(d => (d + 1) % 4);
      }, 400);
    } else {
      setSaveDots(0);
    }
    return () => clearInterval(interval);
  }, [saveLoading]);

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
    setSaveLoading(true); // <-- Start saving
    try {
      const res = await fetch(`${API_URL}/api/saved-connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          connectionString: connStr
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        setError(data.message || 'That connection string already exists, check saved connections list');
        setSaveLoading(false); // <-- Stop saving
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

      // Do NOT redirect to explorer page here
      // await handleUseConnection(connStr); // <-- Remove or comment out this line

    } catch (err) {
      setError(err.message || 'Failed to save connection string.');
    } finally {
      setSaveLoading(false); // <-- Stop saving
    }
  };

  const [useLoading, setUseLoading] = useState(null); // <-- Add this state

  const handleUseConnection = async (connStr) => {
    setError('');
    setUseLoading(connStr); // <-- Set loading for this connection
    try {
      const res = await fetch(`${API_URL}/api/list-databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ connectionString: connStr })
      });
      const dbs = await res.json();
      navigate('/explore', { state: { connectionString: connStr, databases: dbs, user } });
    } catch {
      setError('Failed to fetch databases.');
    } finally {
      setUseLoading(null); // <-- Reset loading state
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

  // --- MOBILE HEADER ---
  const MobileHeader = ({ navigate, sidebarOpen, setSidebarOpen }) => (
    <div
      style={{
        width: '100%',
        height: 56,
        background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px 0 8px',
        position: 'sticky',
        top: 0,
        zIndex: 101,
        boxShadow: '0 2px 12px #6366f122'
      }}
    >
      {/* Hamburger on far left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HamburgerIcon open={sidebarOpen} onClick={() => setSidebarOpen(o => !o)} />
      </div>
      {/* Title centered */}
      <div style={{
        fontWeight: 900,
        fontSize: 22,
        color: '#fff',
        letterSpacing: '-1px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textShadow: '0 2px 12px #6366f155'
      }}>
        <span role="img" aria-label="rocket" style={{ fontSize: 24 }}>🚀</span> zackdb
      </div>
      {/* Logout icon on far right, but with more left margin */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            fetch(`${API_URL}/api/logout`, { credentials: 'include' }).finally(() => {
              navigate('/login');
            });
          }}
          style={{
            background: '#fff',
            color: '#6366f1',
            border: 'none',
            borderRadius: 22,
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #6366f122',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            letterSpacing: '0.5px',
            transition: 'background 0.22s, box-shadow 0.22s, border-radius 0.22s',
            outline: 'none',
            marginLeft: 8,
            marginRight: 12 // <-- Add more space from the right edge
          }}
          title="Logout"
        >
          <span role="img" aria-label="logout" style={{ fontSize: 18 }}>🔒</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 text-primary fs-4">
        Loading...
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-vh-100 w-100 bg-light d-flex flex-column flex-md-row" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          navigate={navigate}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}
      {/* Sidebar */}
      {(isMobile
    ? sidebarOpen // Only render on mobile if open
    : true        // Always render on desktop
  ) && (
  <div style={{
    zIndex: 20,
    position: isMobile ? 'fixed' : 'static',
    width: isMobile ? '100%' : undefined,
    top: 0,
    left: 0
  }}>
    <Sidebar
      user={user}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      isMobile={isMobile}
    />
  </div>
)}
      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(44,62,80,0.13)',
            zIndex: 99
          }}
        />
      )}
      {/* Main content area */}
      <main className="flex-grow-1 d-flex flex-column" style={{ minHeight: isMobile ? 'auto' : '100vh', overflow: 'hidden' }}>
        {/* Desktop Header */}
        <header className="d-none d-md-flex align-items-center justify-content-between px-5 py-3 bg-white shadow-sm sticky-top" style={{ borderBottom: '1.5px solid #e0e7ff', minHeight: 64 }}>
          <div className="fw-bold fs-3" style={{
            color: 'transparent',
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span role="img" aria-label="rocket" style={{ fontSize: 30 }}>🚀</span> zackdb
          </div>
          {/* Desktop Logout Icon */}
          <button
            className="btn btn-light rounded-pill d-flex align-items-center"
            style={{
              color: '#6366f1',
              marginLeft: 8,
              fontWeight: 700,
              fontSize: 17,
              border: 'none',
              boxShadow: '0 2px 12px #6366f122',
              padding: '8px 18px'
            }}
            onClick={() => {
              localStorage.removeItem('token');
              fetch(`${API_URL}/api/logout`, { credentials: 'include' }).finally(() => {
                navigate('/login');
              });
            }}
            title="Logout"
          >
            <span role="img" aria-label="logout" style={{ fontSize: 22 }}>🔒</span>
          </button>
        </header>
        {/* Main horizontal layout */}
        <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center align-items-center py-4"
  style={{
    background: 'linear-gradient(120deg, #f1f5f9 0%, #e0e7ff 100%)',
    // maxWidth: 1400, // Remove or comment out this line
    width: '100%',     // Add this line to ensure full width
    margin: 0          // Remove '0 auto' to avoid centering with a fixed width
  }}
>
          <div className={`row w-100 justify-content-center align-items-start ${isMobile ? '' : 'gx-5'}`}>
            {/* Left: New Connection */}
            <div className="col-12 col-md-6 col-lg-5 mb-4">
              <div className="card shadow-lg border-0 rounded-4" style={{
                background: 'rgba(255,255,255,0.85)',
                minHeight: isMobile ? 'auto' : 480
              }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <div className="mb-2" style={{
                    fontSize: 54,
                    color: 'transparent',
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text'
                  }}>
                    <span role="img" aria-label="rocket">🚀</span>
                  </div>
                  <h1
  className="fw-bold mb-2"
  style={{
    color: 'transparent',
    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    fontSize: 30,
    letterSpacing: '-1px',
    display: isMobile ? 'flex' : undefined,
    flexDirection: isMobile ? 'row' : undefined,
    alignItems: isMobile ? 'center' : undefined,
    gap: isMobile ? 6 : undefined
  }}
>
  Hey
  {user ? (
    <>
      <span style={{ marginLeft: isMobile ? 6 : 0 }}>
        , {isMobile
          ? getShortestName(user.username)
          : user.username
        }!
      </span>
      <span
        role="img"
        aria-label="wave"
        style={{
          marginLeft: 6,
          color: 'initial',
          background: 'none',
          WebkitBackgroundClip: 'unset',
          backgroundClip: 'unset',
          filter: 'none'
        }}
      >👋</span>
    </>
  ) : null}
</h1>
                  <p className="text-center fw-semibold" style={{ color: '#333', opacity: 0.9, fontSize: 18, marginTop: isMobile ? 8 : 4, marginBottom: 24 }}>
                    {user
                      ? 'Connect to your MongoDB database to get started.'
                      : 'Connect to your MongoDB database to get started.'}
                  </p>
                  {/* Connection string input and buttons */}
                  <div className="w-100 d-flex flex-column align-items-center" style={{ gap: 12 }}>
                    <div className="input-group rounded-3 overflow-hidden" style={{ maxWidth: 480, width: '100%' }}>
                      <input
                        type="text"
                        className="form-control border-1 rounded-3 shadow-sm"
                        placeholder="Paste your connection string here"
                        aria-label="Connection string"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        style={{
                          height: 54,
                          fontSize: 16,
                          border: '2px solid #6366f1',
                          boxShadow: '0 1px 6px #6366f122'
                        }}
                      />
                    </div>
                    <button
                      className="btn fw-bold d-flex align-items-center justify-content-center shadow-sm"
                      onClick={() => handleConnect(input)}
                      style={{
                        height: 54,
                        width: '100%',
                        maxWidth: 480,
                        fontSize: 17,
                        background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 2px 12px #6366f122',
                        gap: 10
                      }}
                      disabled={loading || saveLoading}
                    >
                      <span role="img" aria-label="rocket" style={{ fontSize: 22 }}>🚀</span>
                      {saveLoading
                        ? `Saving${'.'.repeat(saveDots)}`
                        : (loading ? 'Connecting...' : 'Save & Connect')}
                    </button>
                    {/* Show only the alert for error, otherwise show the example */}
                    {error ? (
                      <div className="alert alert-danger text-center rounded-3 shadow-sm" style={{ maxWidth: 480, width: '100%', fontSize: 14 }}>
                        {error}
                      </div>
                    ) : (
                      <div
                        className={`text-center rounded-3 shadow-none mt-2`}
                        style={{
                          maxWidth: 480,
                          width: '100%',
                          fontSize: 14,
                          minHeight: 22,
                          color: '#888',
                          opacity: 0.7,
                          transition: 'color 0.2s, opacity 0.2s'
                        }}
                      >
                        Example: <span style={{ fontFamily: 'monospace', color: '#aaa' }}>mongodb+srv://username:password@cluster0.abcde.mongodb.net/</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Saved Connections */}
            <div className="col-12 col-md-6 col-lg-7 mb-4">
              <div className="card shadow-lg border-0 rounded-4" style={{
                background: 'rgba(255,255,255,0.85)',
                minHeight: isMobile ? 'auto' : 480
              }}>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="fw-bold" style={{ fontSize: 22, color: '#333' }}>
                      Your Connections
                    </h2>
                    {/* Refresh button removed */}
                  </div>
                  {/* Connection items list */}
                  <div className="flex-grow-1" style={{ overflowY: 'auto', paddingRight: isMobile ? 0 : 16 }}>
                    {safeConnections.length === 0 ? (
                      <div className="text-center text-muted py-4" style={{ fontSize: 16 }}>
                        No saved connections found.
                      </div>
                    ) : (
                      paginatedConnections.map((conn, idx) => (
                        <div
                          key={conn._id}
                          className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3 mb-3 shadow-sm"
                          style={{
                            border: '1px solid #e0e7ff',
                            minHeight: isMobile ? 64 : undefined, // Ensure consistent row height on mobile
                            height: isMobile ? 64 : undefined
                          }}
                        >
                          {/* Left: Connection info */}
                          <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
                            {/* Remove icon on mobile */}
                            {!isMobile && (
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                                  color: '#fff',
                                  fontSize: 24,
                                  boxShadow: '0 2px 12px rgba(99,102,241,0.2)'
                                }}
                              >
                                <span role="img" aria-label="database" style={{ lineHeight: 1 }}>📦</span>
                              </div>
                            )}
                            <div className="d-flex flex-column justify-content-center" style={{ flex: 1, minWidth: 0 }}>
                              <div
                                className="fw-semibold"
                                style={{
                                  fontSize: 16,
                                  color: '#333',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: isMobile ? 120 : 220, // Fixed width for cluster name on mobile
                                  minWidth: isMobile ? 0 : 120,
                                  textAlign: 'left'
                                }}
                              >
                                {isMobile
                                  ? truncateName(getClusterName(conn.connectionString), 10)
                                  : truncateName(getClusterName(conn.connectionString), 20)
                                }
                              </div>
                            </div>
                          </div>
                          {/* Right: Action buttons */}
                          <div className="d-flex align-items-center gap-2" style={{ minWidth: isMobile ? 150 : undefined }}>
                            <button
                              className="btn fw-bold d-flex align-items-center justify-content-center shadow-sm"
                              onClick={() => handleUseConnection(conn.connectionString)}
                              style={{
                                height: 38,
                                fontSize: 14,
                                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                minWidth: 100,
                                boxShadow: '0 2px 12px #6366f122'
                              }}
                              disabled={useLoading === conn.connectionString}
                            >
                              {useLoading === conn.connectionString ? 'Connecting...' : 'Connect'}
                            </button>
                            <button
                              className="btn fw-bold d-flex align-items-center justify-content-center shadow-sm"
                              onClick={() => setConfirmDelete(conn.connectionString)}
                              style={{
                                height: 38,
                                fontSize: 18,
                                background: 'transparent',
                                color: '#6366f1',
                                border: 'none',
                                borderRadius: 8,
                                minWidth: 38,
                                boxShadow: 'none'
                              }}
                              aria-label="Delete"
                            >
                              <span role="img" aria-label="delete">🗑️</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Pagination controls */}
                  {totalConnPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                      <button
                        className="btn fw-bold shadow-sm"
                        onClick={() => setConnPage(p => Math.max(p - 1, 1))}
                        disabled={connPage === 1}
                        style={{
                          height: 38,
                          fontSize: 14,
                          minWidth: 80,
                          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: '0 2px 12px #6366f122'
                        }}
                      >
                        Previous
                      </button>
                      <div className="text-muted" style={{ fontSize: 14 }}>
                        Page {connPage} of {totalConnPages}
                      </div>
                      <button
                        className="btn fw-bold shadow-sm"
                        onClick={() => setConnPage(p => Math.min(p + 1, totalConnPages))}
                        disabled={connPage === totalConnPages}
                        style={{
                          height: 38,
                          fontSize: 14,
                          minWidth: 80,
                          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: '0 2px 12px #6366f122'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Confirmation dialog for deletion */}
        {confirmDelete && (
          <div className="position-fixed top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 250 }}>
            <div className="bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: 400, width: '90%' }}>
              <h3 className="fw-bold mb-3" style={{ fontSize: 18, color: '#333' }}>
                Confirm Deletion
              </h3>
              <p className="text-muted mb-4" style={{ fontSize: 15 }}>
                Are you sure you want to delete this connection? This action cannot be undone.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn fw-bold shadow-sm"
                  onClick={() => setConfirmDelete(null)}
                  style={{
                    height: 38,
                    fontSize: 14,
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0 2px 12px #6366f122'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn fw-bold shadow-sm"
                  onClick={() => {
                    handleDeleteConnection(confirmDelete);
                    setConfirmDelete(null);
                  }}
                  style={{
                    height: 38,
                    fontSize: 14,
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0 2px 12px #6366f122'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
