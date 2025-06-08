import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_API_URL;

// Helper to get country flag emoji from geolocation (if available), fallback to locale
function getCountryFlag(countryCode) {
  if (!countryCode) return '🌍';
  return countryCode
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
}

// Add this function at the top of your component file
function getClusterName(connectionString) {
  const match = connectionString.match(/@([^\.]+)/);
  return match ? match[1] : '';
}

export default function DatabaseExplorer() {
  const { state } = useLocation();
  const { connectionString, databases: initialDatabases } = state || {};
  const [collections, setCollections] = useState([]);
  const [selectedDb, setSelectedDb] = useState('');
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [columns, setColumns] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [dbPage, setDbPage] = useState(1);
  const [colPage, setColPage] = useState(1);
  const recordsPerPage = 10;
  const dbsPerPage = 5;
  const colsPerPage = 3;
  const navigate = useNavigate();
  const [databases, setDatabases] = useState(initialDatabases || []);

  // For live time display
  const [now, setNow] = useState(new Date());
  const [country, setCountry] = useState('');

  // Loading states
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Auto refresh state
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Ref to store interval ID for auto-refresh
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user's country using geolocation API
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_code))
      .catch(() => {
        // fallback to locale if geolocation fails
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        setCountry(locale.split('-')[1] || 'US');
      });
  }, []);

  // Pagination for databases and collections
  const totalDbPages = Math.ceil((Array.isArray(databases) ? databases.length : 0) / dbsPerPage);
  const paginatedDbs = Array.isArray(databases)
    ? databases.slice((dbPage - 1) * dbsPerPage, dbPage * dbsPerPage)
    : [];
  const totalColPages = Math.ceil((Array.isArray(collections) ? collections.length : 0) / colsPerPage);
  const paginatedCols = Array.isArray(collections)
    ? collections.slice((colPage - 1) * colsPerPage, colPage * colsPerPage)
    : [];

  const handleSelectDb = async (dbName) => {
    setSelectedDb(dbName);
    setSelectedCollection('');
    setDocuments([]);
    setColumns([]);
    setColumnVisibility({});
    setColPage(1);
    setError('');
    setIsLoadingCollections(true);
    stopAutoRefresh(); // Stop auto refresh if running
    try {
      const res = await fetch(`${API_URL}/api/list-collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbName, connectionString })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const cols = await res.json();
      setCollections(cols);
    } catch (err) {
      setError('Failed to fetch collections.');
      setCollections([]);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const [totalDocuments, setTotalDocuments] = useState(0);

  // Fetch documents for a collection (with pagination)
  const fetchDocuments = async (dbName, collectionName, page = 1) => {
    if (!connectionString || !dbName || !collectionName) {
      setError('Missing connection info.');
      setDocuments([]);
      setColumns([]);
      setColumnVisibility({});
      return;
    }
    setIsLoadingDocuments(true);
    setError('');
    try {
      // Do NOT encodeURIComponent here; URLSearchParams handles encoding
      const params = new URLSearchParams({
        connectionString,
        dbName,
        collectionName,
        page,
        pageSize: recordsPerPage
      });
      const res = await fetch(`${API_URL}/api/documents?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const { documents: docs, total } = await res.json();
      setDocuments(docs);
      setTotalDocuments(total);
      const cols = docs.length > 0 ? Object.keys(docs[0]) : [];
      setColumns(cols);
      const initialVisibility = {};
      cols.forEach(col => {
        if (col === 'password' || col === '_V' || col.startsWith('-')) {
          initialVisibility[col] = false;
        } else {
          initialVisibility[col] = true;
        }
      });
      setColumnVisibility(initialVisibility);
    } catch (err) {
      setDocuments([]);
      setColumns([]);
      setColumnVisibility({});
      setError('Failed to fetch documents.');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Start auto refresh interval
  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) return; // already running
    refreshIntervalRef.current = setInterval(() => {
      fetchDocuments(selectedDb, selectedCollection);
    }, 5000);
    setIsAutoRefreshing(true);
  };

  // Stop auto refresh interval
  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setIsAutoRefreshing(false);
  };

  // Clear interval on unmount or when selectedCollection changes
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [selectedCollection]);

  // Toggle column visibility
  const toggleColumn = (col) => {
    setColumnVisibility(prev => ({
      ...prev,
      [col]: !prev[col]
    }));
  };

  // Only show columns that are visible
  const visibleColumns = columns.filter(col => columnVisibility[col]);

  // Pagination logic for table
  const totalPages = Math.ceil(totalDocuments / recordsPerPage);
  // Use the documents as returned from the backend (already paginated and sorted)
  const paginatedDocs = documents;

  // --- Styling --- ULTRA MODERN THEME ---
  const glass = {
    background: 'rgba(255,255,255,0.72)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    border: '1.5px solid rgba(200,200,255,0.13)'
  };
  const sidebarStyle = {
    width: 260,
    minWidth: 200,
    background: 'linear-gradient(160deg, #6366f1 60%, #818cf8 100%)',
    borderRadius: 18,
    boxShadow: '0 4px 24px #6366f144',
    padding: '24px 14px',
    marginRight: 32,
    height: 'calc(100vh - 110px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff'
  };
  const cardStyle = {
    display: 'block',
    background: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    boxShadow: '0 2px 8px #6366f122',
    padding: '12px 20px',
    margin: '0 0 10px 0',
    fontWeight: 600,
    fontSize: 15,
    color: '#23272f',
    cursor: 'pointer',
    border: '2px solid #6366f1',
    transition: 'background 0.2s, color 0.2s, border 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  const cardSelected = {
    ...cardStyle,
    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
    color: '#fff',
    border: '2px solid #818cf8'
  };
  const tableContainerStyle = {
    width: '100%',
    maxWidth: 980,
    height: 'calc(100vh - 110px)',
    overflowX: 'auto',
    overflowY: 'auto',
    ...glass,
    borderRadius: 18,
    marginTop: 0,
    display: 'flex',
    flexDirection: 'column',
    color: '#23272f'
  };
  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    background: 'rgba(255,255,255,0.95)'
  };
  const thStyle = {
    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
    color: '#fff',
    padding: '8px 10px',
    fontWeight: 700,
    border: '1px solid #e0e7ff',
    fontSize: 15
  };
  const tdStyle = {
    padding: '8px 10px',
    border: '1px solid #e0e7ff',
    fontSize: 14,
    minHeight: 24,
    height: 38,
    background: 'rgba(255,255,255,0.85)',
    color: '#23272f'
  };

  const buttonStyle = {
    padding: '6px 14px',
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
    color: '#fff',
    boxShadow: '0 2px 8px #6366f133',
    userSelect: 'none',
    minWidth: 130,
  };

  const handleFetchDatabases = async (connectionString) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/list-databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        Swal.fire({
          icon: 'error',
          title: 'Database Fetch Failed',
          text: data.error || 'Failed to fetch databases.'
        }).then(() => {
          navigate('/dashboard');
        });
        setError(data.error || 'Failed to fetch databases.');
        return;
      }
      setDatabases(data);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Database Fetch Failed',
        text: 'Failed to fetch databases.'
      }).then(() => {
        navigate('/dashboard');
      });
      setError('Failed to fetch databases.');
    }
  };

  useEffect(() => {
    if (connectionString) {
      handleFetchDatabases(connectionString);
    }
    // eslint-disable-next-line
  }, [connectionString]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchDocuments(selectedDb, selectedCollection, page);
  };

  const handleSelectCollection = (collectionName) => {
    setSelectedCollection(collectionName);
    setError('');
    setCurrentPage(1);
    stopAutoRefresh();
    fetchDocuments(selectedDb, collectionName, 1);
  };

  return (
    <div style={{
      padding: 24,
      background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
      minHeight: '100vh'
    }}>
      {/* Top Row: Home Button + Local Time */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 20px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            marginBottom: 0,
            boxShadow: '0 2px 12px #6366f133'
          }}
        >
          <span role="img" aria-label="home" style={{ marginRight: 8 }}>🏠</span>
          Home
        </button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 700,
          fontSize: 16,
          color: '#23272f',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 10,
          padding: '7px 18px',
          boxShadow: '0 2px 8px #6366f122'
        }}>
          <span style={{ fontSize: 22 }}>{getCountryFlag(country)}</span>
          <span>
            {now.toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZoneName: 'short'
            })}
          </span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
        marginTop: 0,
        flexWrap: 'wrap'
      }}>
        <h2 style={{
          color: 'transparent',
          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          fontWeight: 900,
          fontSize: 28,
          margin: 0
        }}>Database Explorer</h2>
        {columns.length > 0 && (
          <div>
            {columns.map(col => (
              <label key={col} style={{ marginRight: 14, fontWeight: 500, fontSize: 15, color: '#23272f' }}>
                <input
                  type="checkbox"
                  checked={!!columnVisibility[col]}
                  onChange={() => toggleColumn(col)}
                  style={{ marginRight: 4 }}
                /> Show {col}
              </label>
            ))}
          </div>
        )}
      </div>
      {error && <div style={{ color: '#ff5252', marginBottom: 12, fontWeight: 600 }}>{error}</div>}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <div>
            <h3 style={{
              color: '#fff',
              marginBottom: 10,
              marginTop: 0,
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}>Databases</h3>
            {paginatedDbs.map(db => (
              <span
                key={db}
                style={selectedDb === db ? cardSelected : cardStyle}
                onClick={() => handleSelectDb(db)}
                title={db}
              >
                <span role="img" aria-label="database" style={{ marginRight: 10, fontSize: 18, verticalAlign: 'middle' }}>📁</span>
                {db}
              </span>
            ))}
            {/* Database Pagination */}
            {totalDbPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <button
                  onClick={() => setDbPage(p => Math.max(1, p - 1))}
                  disabled={dbPage === 1}
                  style={{
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 14px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: dbPage === 1 ? 'not-allowed' : 'pointer',
                    marginRight: 8,
                    opacity: dbPage === 1 ? 0.5 : 1
                  }}
                >Prev</button>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>
                  {dbPage}/{totalDbPages}
                </span>
                <button
                  onClick={() => setDbPage(p => Math.min(totalDbPages, p + 1))}
                  disabled={dbPage === totalDbPages}
                  style={{
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 14px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: dbPage === totalDbPages ? 'not-allowed' : 'pointer',
                    marginLeft: 8,
                    opacity: dbPage === totalDbPages ? 0.5 : 1
                  }}
                >Next</button>
              </div>
            )}
          </div>
          {collections.length > 0 && (
            <div>
              <h3 style={{
                color: '#fff',
                margin: '22px 0 10px 0',
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: '-0.5px'
              }}>
                Collections
              </h3>
              {paginatedCols.map(col => (
                <span
                  key={col}
                  style={selectedCollection === col ? cardSelected : cardStyle}
                  onClick={() => handleSelectCollection(col)}
                  title={col}
                >
                  <span role="img" aria-label="collection" style={{ marginRight: 10, fontSize: 18, verticalAlign: 'middle' }}>📂</span>
                  {col}
                </span>
              ))}
              {/* Collections Pagination */}
              {totalColPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                  <button
                    onClick={() => setColPage(p => Math.max(1, p - 1))}
                    disabled={colPage === 1}
                    style={{
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 14px',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: colPage === 1 ? 'not-allowed' : 'pointer',
                      marginRight: 8,
                      opacity: colPage === 1 ? 0.5 : 1
                    }}
                  >Prev</button>
                  <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>
                    {colPage}/{totalColPages}
                  </span>
                  <button
                    onClick={() => setColPage(p => Math.min(totalColPages, p + 1))}
                    disabled={colPage === totalColPages}
                    style={{
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 14px',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: colPage === totalColPages ? 'not-allowed' : 'pointer',
                      marginLeft: 8,
                      opacity: colPage === totalColPages ? 0.5 : 1
                    }}
                  >Next</button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Main Table Area */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          height: 'calc(100vh - 110px)'
        }}>
          {columns.length > 0 && (
            <div style={tableContainerStyle}>
              {/* Table Title Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // space between title and buttons
                marginBottom: 10,
                marginTop: 0,
                width: '100%' // take full width of card
              }}>
                <h4 style={{
                  color: 'transparent',
                  background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  fontWeight: 800,
                  fontSize: 20,
                  margin: 0,
                  textAlign: 'center', // center text
                  width: '100%' // ensure h4 takes full width
                }}>
                  Table: <span style={{
                    color: '#6366f1',
                    background: 'none',
                    WebkitBackgroundClip: 'initial',
                    backgroundClip: 'initial'
                  }}>{selectedCollection}</span>
                </h4>
                <div style={{ marginLeft: 16, display: 'flex', gap: 12 }}>
                  {!isAutoRefreshing ? (
                    <>
                      <button
                        onClick={() => fetchDocuments(selectedDb, selectedCollection)}
                        disabled={isLoadingDocuments || !selectedCollection}
                        style={buttonStyle}
                        title="Manual Refresh"
                      >
                        {isLoadingDocuments ? 'Refreshing...' : '🔄 Manual Refresh'}
                      </button>
                      <button
                        onClick={startAutoRefresh}
                        disabled={isLoadingDocuments || !selectedCollection}
                        style={buttonStyle}
                        title="Start Auto Refresh"
                      >
                        🔁 Auto Refresh
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={stopAutoRefresh}
                      style={buttonStyle}
                      title="Stop Auto Refresh"
                    >
                      ⏹️ Stop Auto Refresh
                    </button>
                  )}
                </div>
              </div>
              {/* Table */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                minHeight: 0,
                width: '100%',
                maxWidth: 980,
                display: 'flex',
                justifyContent: 'center'
              }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>#</th>
                      {visibleColumns.map(col => (
                        <th key={col} style={thStyle}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocs.map((doc, idx) => {
                      // Now absoluteIdx counts from the reversed array
                      const absoluteIdx = (currentPage - 1) * recordsPerPage + idx;
                      return (
                        <tr
                          key={idx}
                          style={{
                            background: absoluteIdx % 2 === 0 ? 'rgba(255,255,255,0.95)' : '#f1f5fd',
                            height: 38
                          }}
                        >
                          <td style={{ ...tdStyle, height: 38 }}>
                            {absoluteIdx + 1}
                          </td>
                          {visibleColumns.map(col => (
                            <td key={col} style={{ ...tdStyle, height: 38 }}>
                              {(col === 'createdAt' || col === 'updatedAt')
                                ? (doc[col]
                                    ? new Date(doc[col]).toLocaleString(undefined, { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric', 
                                        hour: '2-digit', 
                                        minute: '2-digit', 
                                        second: '2-digit',
                                        hour12: false,
                                        timeZoneName: 'short'
                                      })
                                    : ''
                                  )
                                : String(doc[col])
                              }
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 0'
                }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 18px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      marginRight: 10,
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                  >
                    Prev
                  </button>
                  <span style={{ fontWeight: 700, color: '#6366f1', fontSize: 15 }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 18px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      marginLeft: 10,
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
              {/* Footer directly below the table */}
              <footer style={{
                width: '100%',
                textAlign: 'center',
                marginTop: 24,
                padding: '18px 0 8px 0',
                color: '#6366f1',
                fontWeight: 600,
                fontSize: 15,
                opacity: 0.85,
                letterSpacing: '0.5px'
              }}>
                &copy; {new Date().getFullYear()} All Rights Reserved | ZACKDB
              </footer>
            </div>
          )}
          {(isLoadingCollections || isLoadingDocuments) && (
            <div style={{ marginTop: 20, fontWeight: 600, color: '#6366f1' }}>
              Loading...
            </div>
          )}
        </div>
      </div>
      {/* For each connection, display the cluster name:
      <div>
        <strong>Cluster Name:</strong> {getClusterName(connection.connectionString)}
      </div>
      <div>
        <strong>Connection String:</strong> {connection.connectionString}
      </div> */}
    </div>
  );
}
