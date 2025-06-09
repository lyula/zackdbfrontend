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

function truncateName(name, maxLength = 10) {
  return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
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

  // Sidebar visibility logic for both mobile and desktop
  const sidebarStyles = {
    width: sidebarOpen ? 270 : 0,
    minWidth: 0,
    maxWidth: 270,
    height: '100vh',
    background: 'linear-gradient(120deg, #6366f1 0%, #818cf8 100%)',
    boxShadow: sidebarOpen ? '0 0 32px 0 rgba(99,102,241,0.13), 0 2px 12px #818cf855' : 'none',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 200,
    transition: 'width 0.45s cubic-bezier(.4,1.6,.6,1), box-shadow 0.3s',
    overflow: 'hidden',
    position: isMobile ? 'fixed' : 'static',
    top: 0,
    left: 0,
    display: sidebarOpen ? 'flex' : 'none',
    flexDirection: 'column'
  };

  return (
    <nav
      className="d-flex flex-column bg-gradient"
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
            ? { marginTop: 64 } // Move down on mobile
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
            <div className="fw-bold text-white fs-4 text-center mb-1" style={{ textShadow: '0 2px 12px #6366f155' }}>
              {user?.username || user?.email || 'User'}
            </div>
            <div className="text-white fs-6 fw-semibold mb-2 text-center" style={{ opacity: 0.96, textShadow: '0 1px 8px #6366f122' }}>
              {user?.email || ''}
            </div>
            <div className="text-white fs-6 fw-normal mb-2 text-center" style={{ opacity: 0.98, textShadow: '0 1px 8px #6366f122' }}>
              Save and visualize your MongoDB databases with ease.
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2 text-white opacity-75 fw-semibold mt-2" style={{ letterSpacing: '0.1em' }}>
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
            ? { marginBottom: 18, marginTop: 0, paddingBottom: 8 }
            : {}
        }
      >
        <button
          className="btn fw-bold d-flex align-items-center gap-2"
          style={{
            width: sidebarOpen ? 120 : 44,
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
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
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Update sidebar state if screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
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
    try {
      const res = await fetch(`${API_URL}/api/saved-connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ connectionString: connStr }) // Only send connectionString
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
      <div style={{ zIndex: 20, position: isMobile ? 'relative' : 'static', width: isMobile ? '100%' : undefined }}>
        <Sidebar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />
      </div>
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
        </header>
        {/* Main horizontal layout */}
        <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center align-items-center py-4" style={{ background: 'linear-gradient(120deg, #f1f5f9 0%, #e0e7ff 100%)' }}>
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
                  <h1 className="fw-bold mb-2" style={{
                    color: 'transparent',
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    fontSize: 30,
                    letterSpacing: '-1px'
                  }}>
                    Welcome{user ? `, ${user.username}` : ''}!
                  </h1>
                  <div className="text-secondary fs-5 mb-3 fw-medium text-center opacity-85">
                    Connect to your MongoDB database to get started.
                  </div>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Paste your MongoDB connection string here"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{
                      maxWidth: 340,
                      border: '1.5px solid #6366f1',
                      background: 'rgba(255,255,255,0.95)'
                    }}
                  />
                  <button
                    className="btn fw-bold mb-2 px-4 py-2"
                    style={{
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      color: '#fff',
                      borderRadius: 10,
                      fontSize: 17,
                      letterSpacing: '0.5px'
                    }}
                    onClick={() => handleConnect(input)}
                    disabled={!input}
                  >
                    <span role="img" aria-label="rocket" className="me-2">🚀</span>
                    Save & Connect
                  </button>
                  {error && (
                    <div className="text-primary fw-bold mt-2 text-center" style={{ fontSize: 15 }}>
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right: Saved Connections */}
            <div className="col-12 col-md-6 col-lg-5 mb-4">
              <div className="card shadow-lg border-0 rounded-4 position-relative" style={{
                background: 'rgba(255,255,255,0.85)',
                minHeight: isMobile ? 'auto' : 480
              }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <div className="fw-bold fs-4 mb-3" style={{
                    color: 'transparent',
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text'
                  }}>
                    Saved Connections
                  </div>
                  {!isConnectionsArray ? (
                    <div className="text-danger fs-6 mt-4">
                      Failed to load saved connections. Please try again later.
                    </div>
                  ) : paginatedConnections.length === 0 ? (
                    <div className="text-muted fs-6 mt-4">No saved connections yet.</div>
                  ) : (
                    <ul className="list-group w-100 mb-3 border-0">
                      {paginatedConnections.map((conn, idx) => {
                        const clusterName = getClusterName(conn.connectionString);
                        const displayName = truncateName(clusterName, 10);
                        const isLoading = useLoading === conn.connectionString;
                        return (
                          <li key={conn._id} className="list-group-item border-0 mb-2 rounded-3 d-flex justify-content-between align-items-center" style={{
                            background: 'rgba(245,245,255,0.88)',
                            boxShadow: '0 2px 8px #6366f111'
                          }}>
                            <div>
                              <span
                                className="fw-bold px-3 py-2 rounded-2 d-inline-block text-truncate"
                                style={{
                                  background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                                  color: '#fff',
                                  fontSize: 17,
                                  letterSpacing: '0.5px',
                                  boxShadow: '0 2px 8px #6366f122',
                                  minWidth: 120,
                                  maxWidth: 120,
                                  height: 40,
                                  lineHeight: '24px',
                                  verticalAlign: 'middle',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center'
                                }}
                                title={conn.clusterName || clusterName}
                              >
                                {displayName}
                              </span>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <button
                                className="btn fw-bold d-flex align-items-center justify-content-center"
                                style={{
                                  background: isLoading
                                    ? 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)'
                                    : 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                                  color: '#fff',
                                  borderRadius: 8,
                                  minWidth: 90,
                                  height: 40,
                                  fontSize: 15,
                                  opacity: isLoading ? 0.7 : 1,
                                  position: 'relative',
                                  padding: '0 18px'
                                }}
                                onClick={() => handleUseConnection(conn.connectionString)}
                                disabled={isLoading}
                              >
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 54,
                                    minWidth: 54,
                                    height: 24,
                                    position: 'relative'
                                  }}
                                >
                                  {isLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ color: '#fff' }} />
                                  ) : (
                                    <>
                                      <span role="img" aria-label="rocket" className="me-1">🚀</span>
                                      Use
                                    </>
                                  )}
                                </span>
                              </button>
                              <button
                                className="btn btn-link p-0"
                                title="Delete"
                                ref={el => deleteBtnRefs.current[conn.connectionString] = el}
                                onClick={() => setConfirmDelete(conn.connectionString)}
                                style={{ fontSize: 22, color: '#f87171' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {/* Pagination */}
                  {totalConnPages > 1 && (
                    <nav className="d-flex align-items-center gap-2 mt-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-2"
                        onClick={() => setConnPage(p => Math.max(1, p - 1))}
                        disabled={connPage === 1}
                      >
                        Prev
                      </button>
                      <span className="fw-bold text-primary">{connPage} / {totalConnPages}</span>
                      <button
                        className="btn btn-outline-primary btn-sm rounded-2"
                        onClick={() => setConnPage(p => Math.min(totalConnPages, p + 1))}
                        disabled={connPage === totalConnPages}
                      >
                        Next
                      </button>
                    </nav>
                  )}
                  {/* Modal Backdrop and Modal */}
                  {!isMobile && confirmDelete && (
                    <>
                      <div
                        className="modal-backdrop fade show"
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(44, 62, 80, 0.18)',
                          zIndex: 120,
                          borderRadius: 22
                        }}
                      />
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 121
                        }}
                      >
                        <div className="modal-dialog modal-dialog-centered" style={{ minWidth: 280, maxWidth: 340 }}>
                          <div className="modal-content rounded-4 shadow">
                            <div className="modal-header border-0">
                              <h5 className="modal-title text-primary fw-bold">Confirm Delete</h5>
                            </div>
                            <div className="modal-body text-center">
                              Are you sure you want to delete this connection?
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-center gap-3">
                              <button
                                className="btn btn-danger px-4"
                                onClick={() => {
                                  handleDeleteConnection(confirmDelete);
                                  setConfirmDelete(null);
                                }}
                              >
                                Delete
                              </button>
                              <button
                                className="btn btn-outline-primary px-4"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Confirm Delete Modal */}
        {isMobile && confirmDelete && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={() => setConfirmDelete(null)}
              style={{
                position: 'fixed',
                top: 56,
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 56px)',
                background: 'rgba(44, 62, 80, 0.18)',
                zIndex: 2000
              }}
            />
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                position: 'fixed',
                top: 56,
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 56px)',
                zIndex: 2001,
                overflowY: 'auto'
              }}
            >
              <div className="modal-dialog modal-dialog-centered" style={{ minWidth: 280, maxWidth: '94vw' }}>
                <div className="modal-content rounded-4 shadow">
                  <div className="modal-header border-0">
                    <h5 className="modal-title text-primary fw-bold">Confirm Delete</h5>
                  </div>
                  <div className="modal-body text-center">
                    Are you sure you want to delete this connection?
                  </div>
                  <div className="modal-footer border-0 d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-danger px-4"
                      onClick={() => {
                        handleDeleteConnection(confirmDelete);
                        setConfirmDelete(null);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-outline-primary px-4"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
