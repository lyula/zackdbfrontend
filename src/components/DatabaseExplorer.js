import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CollectionEditModal from './modalActions';

const API_URL = 'https://zackdbbackend.onrender.com';

// Helper to get country flag emoji from country code (works for all ISO 3166-1 alpha-2 codes)
function getCountryFlag(countryCode) {
  if (
    !countryCode ||
    typeof countryCode !== 'string' ||
    countryCode.length !== 2 ||
    !/^[A-Z]{2}$/i.test(countryCode)
  ) {
    return '🌍';
  }
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

// Custom hook to determine if the device is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

// Custom hook to get screen size category
function useScreenCategory() {
  const getCategory = () => {
    if (window.innerWidth >= 3840) return 'xxlarge';
    if (window.innerWidth >= 2560) return 'xlarge';
    if (window.innerWidth >= 1920) return 'large';
    if (window.innerWidth <= 768) return 'mobile';
    return 'normal';
  };
  const [category, setCategory] = useState(getCategory());
  useEffect(() => {
    const onResize = () => setCategory(getCategory());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return category;
}

// Remove dbsPerPage/dbPage from sortDatabases, just sort and split
function getPaginatedDatabases(databases, dbPage, dbsPerPage) {
  const special = ['admin', 'local'];
  const normalDbs = databases.filter((db) => !special.includes(db));
  const specialDbs = databases.filter((db) => special.includes(db));
  const totalDbPages = Math.ceil((normalDbs.length + specialDbs.length) / dbsPerPage);

  let paginatedDbs = normalDbs.slice((dbPage - 1) * dbsPerPage, dbPage * dbsPerPage);

  if (dbPage === totalDbPages) {
    paginatedDbs = paginatedDbs.concat(specialDbs);
  }

  return paginatedDbs;
}

export default function DatabaseExplorer() {
  const { state } = useLocation();
  const { connectionString, databases: initialDatabases, user } = state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!connectionString) {
      navigate('/dashboard');
    }
  }, [connectionString, navigate]);

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

  const screenCategory = useScreenCategory();
  const isMobile = screenCategory === 'mobile';
  const isLargeScreen = screenCategory === 'large';
  const isXLargeScreen = screenCategory === 'xlarge';

  const recordsPerPage =
    screenCategory === 'xxlarge'
      ? 39
      : isXLargeScreen
      ? 40
      : isLargeScreen
      ? 15
      : 10;

  const dbsPerPage = isMobile ? 3 : 5;
  const colsPerPage = isMobile ? 3 : 3;
  const [databases, setDatabases] = useState(initialDatabases || []);
  const [isSidebarVisible, setIsSidebarVisible] = useState(!isMobile || !selectedCollection);

  const [now, setNow] = useState(new Date());
  const [country, setCountry] = useState('');
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isInitialDocumentsLoad, setIsInitialDocumentsLoad] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isPostingDocument, setIsPostingDocument] = useState(false);

  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [refreshingType, setRefreshingType] = useState('');

  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let intervalId;
    const fetchLocation = () => {
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((data) => {
          setCountry(data.country_code || 'US');
          setUserTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        })
        .catch(() => {
          const locale = Intl.DateTimeFormat().resolvedOptions().locale;
          setCountry(locale.split('-')[1] || 'US');
          setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        });
    };
    fetchLocation();
    intervalId = setInterval(fetchLocation, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarVisible(!selectedCollection);
    } else {
      setIsSidebarVisible(true);
    }
  }, [selectedCollection, isMobile]);

  const totalDbPages = Math.ceil((Array.isArray(databases) ? databases.length : 0) / dbsPerPage) || 1;
  const paginatedDbs = Array.isArray(databases)
    ? getPaginatedDatabases(databases, dbPage, dbsPerPage)
    : [];
  const totalColPages = Math.ceil((Array.isArray(collections) ? collections.length : 0) / colsPerPage) || 1;
  const paginatedCols = Array.isArray(collections)
    ? collections.slice().reverse().slice((colPage - 1) * colsPerPage, colPage * colsPerPage)
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
    stopAutoRefresh();
    try {
      const res = await fetch(`${API_URL}/api/list-collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbName, connectionString }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const cols = await res.json();
      if (!Array.isArray(cols)) {
        throw new Error('Invalid collections data');
      }
      setCollections(cols);
    } catch (err) {
      setError('Failed to fetch collections.');
      setCollections([]);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const [totalDocuments, setTotalDocuments] = useState(0);
  const [documentsCache, setDocumentsCache] = useState({});

  const prefetchPages = (
    dbName,
    collectionName,
    centerPage,
    totalDocs,
    range = 10,
    forceBackend = false
  ) => {
    for (let i = centerPage - range; i <= centerPage + range; i++) {
      if (i > 0 && i <= Math.ceil(totalDocs / recordsPerPage)) {
        const cacheKey = `${dbName}_${collectionName}_${i}_${recordsPerPage}`;
        if (forceBackend || !documentsCache[cacheKey]) {
          fetch(
            `${API_URL}/api/documents?${new URLSearchParams({
              connectionString: encodeURIComponent(connectionString),
              dbName: encodeURIComponent(dbName),
              collectionName: encodeURIComponent(collectionName),
              page: i,
              limit: recordsPerPage,
            }).toString()}`,
            {
              method: 'GET',
              credentials: 'include',
            }
          )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && Array.isArray(data.documents)) {
                setDocumentsCache((prev) => ({
                  ...prev,
                  [cacheKey]: data.documents,
                }));
              }
            })
            .catch(() => {});
        }
      }
    }
  };

  const fetchDocuments = async (
    dbName,
    collectionName,
    page = 1,
    forceBackend = false,
    refreshType = ''
  ) => {
    if (!connectionString || !dbName || !collectionName) {
      setError('Missing connection info.');
      return;
    }
    setIsLoadingDocuments(true);
    setRefreshingType(refreshType);
    setError('');
    try {
      const shouldForceBackend = forceBackend || refreshType === 'manual';
      const params = new URLSearchParams({
        connectionString: encodeURIComponent(connectionString),
        dbName: encodeURIComponent(dbName),
        collectionName: encodeURIComponent(collectionName),
        page,
        limit: recordsPerPage,
      });
      const cacheKey = `${dbName}_${collectionName}_${page}_${recordsPerPage}`;
      if (shouldForceBackend || !documentsCache[cacheKey]) {
        const res = await fetch(`${API_URL}/api/documents?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP error! status: ${res.status} - ${text}`);
        }
        const data = await res.json();
        if (!data || !Array.isArray(data.documents)) {
          throw new Error('Invalid documents data');
        }
        const docs = data.documents;
        setDocuments(docs);
        setTotalDocuments(data.total || 0);
        setCurrentPage(page);

        setDocumentsCache((prev) => ({
          ...prev,
          [cacheKey]: docs,
        }));

        if (shouldForceBackend || columns.length === 0) {
          let widestDoc = docs[0] || {};
          for (const doc of docs) {
            if (Object.keys(doc).length > Object.keys(widestDoc).length) {
              widestDoc = doc;
            }
          }
          const cols = Object.keys(widestDoc);
          setColumns(cols);
          const initialVisibility = {};
          cols.forEach((col) => {
            initialVisibility[col] = !(
              col === 'password' ||
              col === '_V' ||
              col === '__v' ||
              col.startsWith('-')
            );
          });
          setColumnVisibility(initialVisibility);
        }

        prefetchPages(dbName, collectionName, page, data.total || 0, 10, true);
      } else {
        setDocuments(documentsCache[cacheKey]);
        setCurrentPage(page);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch documents.');
      Swal.fire({
        icon: 'error',
        title: 'Failed to Fetch Documents',
        text: err.message || 'Unknown error occurred while fetching documents.',
      });
    } finally {
      setIsLoadingDocuments(false);
      setRefreshingType('');
      setIsInitialDocumentsLoad(false);
    }
  };

  const fetchAllDocuments = async (dbName, collectionName) => {
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
      const params = new URLSearchParams({
        connectionString: encodeURIComponent(connectionString),
        dbName: encodeURIComponent(dbName),
        collectionName: encodeURIComponent(collectionName),
      });
      const res = await fetch(`${API_URL}/api/documents-all?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${text}`);
      }
      const data = await res.json();
      if (!data || !Array.isArray(data.documents)) {
        throw new Error('Invalid documents data');
      }
      const docs = data.documents;
      setDocuments(docs);
      setTotalDocuments(docs.length);
      setCurrentPage(1);
      const cols = docs.length > 0 ? Object.keys(docs[0]) : [];
      setColumns(cols);
      const initialVisibility = {};
      cols.forEach((col) => {
        initialVisibility[col] = !(
          col === 'password' ||
          col === '_V' ||
          col === '__v' ||
          col.startsWith('-')
        );
      });
      setColumnVisibility(initialVisibility);
      setDocuments(docs.slice(0, recordsPerPage));
    } catch (err) {
      setDocuments([]);
      setError(err.message || 'Failed to fetch documents.');
      setColumns([]);
      setColumnVisibility({});
      Swal.fire({
        icon: 'error',
        title: 'Failed to Fetch Documents',
        text: err.message || 'Unknown error occurred while fetching documents.',
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) return;
    fetchDocuments(selectedDb, selectedCollection, currentPage, true, 'auto');
    refreshIntervalRef.current = setInterval(() => {
      fetchDocuments(selectedDb, selectedCollection, currentPage, true, 'auto');
    }, 5000);
    setIsAutoRefreshing(true);
  };

  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setIsAutoRefreshing(false);
  };

  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [selectedCollection]);

  const toggleColumn = (col) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  const visibleColumns = columns.filter((col) => columnVisibility[col]);

  const totalPages = Math.ceil(totalDocuments / recordsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    const cacheKey = `${selectedDb}_${selectedCollection}_${page}_${recordsPerPage}`;
    if (documentsCache[cacheKey]) {
      setDocuments(documentsCache[cacheKey]);
      setCurrentPage(page);
      prefetchPages(selectedDb, selectedCollection, page, totalDocuments, 10, false);
    } else {
      fetchDocuments(selectedDb, selectedCollection, page);
    }
  };

  const responsiveFont = (base) =>
    screenCategory === 'xxlarge'
      ? base + 8
      : isXLargeScreen
      ? base + 3
      : isLargeScreen
      ? base + 2
      : base;

  const sidebarStyle = {
    width: isMobile ? '100%' : 260,
    minWidth: isMobile ? 'unset' : 200,
    background: 'linear-gradient(160deg, #6366f1 60%, #818cf8 100%)',
    borderRadius: 18,
    boxShadow: '0 4px 24px #6366f144',
    padding: isMobile ? '12px 6px' : '24px 14px',
    marginRight: isMobile ? 0 : 32,
    height: isMobile ? 'auto' : 'calc(100vh - 110px)',
    maxHeight: isMobile ? 'none' : 'calc(100vh - 110px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    fontSize: responsiveFont(15),
  };
  const cardStyle = {
    display: 'block',
    background: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    boxShadow: '0 2px 8px #6366f122',
    padding: '12px 20px',
    margin: '0 0 10px 0',
    fontWeight: 600,
    fontSize: responsiveFont(15),
    color: '#23272f',
    cursor: 'pointer',
    border: '2px solid #6366f1',
    transition: 'background 0.2s, color 0.2s, border 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  const cardSelected = {
    ...cardStyle,
    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8)',
    color: '#fff',
    border: '2px solid #818cf8',
  };
  const tableContainerStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.95)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)',
    border: '1.5px solid #e0e7ff',
    borderRadius: 18,
    marginTop: screenCategory === 'xxlarge' || isXLargeScreen || isLargeScreen ? 32 : 0,
    marginBottom: screenCategory === 'xxlarge' || isXLargeScreen || isLargeScreen ? 32 : 0,
    display: 'flex',
    flexDirection: 'column',
    color: '#23272f',
    padding: isMobile ? '0' : '18px 18px 0 18px',
    fontSize: responsiveFont(14),
    height: isMobile ? 'calc(100vh - 110px)' : 'auto',
    overflowY: isMobile ? 'auto' : 'visible',
    overflowX: 'auto',
  };
  const tableStyle = {
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: '100%',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px #6366f122',
    marginBottom: 0,
    overflow: 'hidden',
    fontSize: responsiveFont(13),
  };
  const thStyle = {
    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
    color: '#fff',
    padding: '6px 10px',
    fontWeight: 700,
    border: 'none',
    fontSize: responsiveFont(14),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  };
  const tdStyle = {
    padding: '6px 10px',
    border: 'none',
    fontSize: responsiveFont(13),
    background: '#fff',
    color: '#23272f',
    verticalAlign: 'middle',
    height: 32,
  };
  const buttonStyle = {
    padding: '10px 14px',
    fontSize: responsiveFont(14),
    fontWeight: '700',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(to right, #6366f1, #818cf8)',
    color: '#fff',
    boxShadow: '0 2px 8px #6366f133',
    userSelect: 'none',
    minWidth: '130px',
  };

  const handleFetchDatabases = async (connectionString) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/list-databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        Swal.fire({
          icon: 'error',
          title: 'Database Fetch Failed',
          description: data.error || 'Failed to fetch databases.',
        }).then(() => {
          navigate('/dashboard');
        });
        setError(data.error || 'Failed to fetch databases');
        return;
      }
      if (!Array.isArray(data)) {
        throw new Error('Invalid databases data');
      }
      setDatabases(data);
    } catch (err) {
      setError('Failed to fetch databases.');
      Swal.fire({
        icon: 'error',
        title: 'Database Fetch Failed',
        description: 'Failed to fetch databases.',
      }).then(() => {
        navigate('/dashboard');
      });
    }
  };

  useEffect(() => {
    if (connectionString) {
      handleFetchDatabases(connectionString);
    }
    // eslint-disable-next-line
  }, [connectionString]);

  const handleSelectCollection = (collectionName) => {
    setSelectedCollection(collectionName);
    setSearchTerm('');
    setSearchField('');
    setError('');
    setCurrentPage(1);
    stopAutoRefresh();
    setIsInitialDocumentsLoad(true);

    setDocumentsCache({});
    setColumns([]);
    setColumnVisibility({});
    setDocuments([]);
    setTotalDocuments(0);

    fetchDocuments(selectedDb, collectionName, 1, true);

    if (isMobile) setIsSidebarVisible(false);
  };

  const showSpinner = isLoadingCollections || (isInitialDocumentsLoad && isLoadingDocuments);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('');

  const filteredDocuments =
    searchTerm && searchField
      ? documents.filter((doc) =>
          String(doc[searchField]?.toString() || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : documents;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalOperation, setModalOperation] = useState('create');
  const [editDocId, setEditDocId] = useState('');
  const [editDoc, setEditDoc] = useState({});
  const [deleteDocId, setDeleteDocId] = useState('');
  const excludedFields = ['_id', 'password', '__v', '_V'];

  // Helper: Poll until table reflects the expected change
  const pollUntilTableReflects = async (checkFn, maxAttempts = 10, interval = 1000) => {
    setRefreshingType('manual');
    setIsLoadingDocuments(true);
    let attempts = 0;
    while (attempts < maxAttempts) {
      await fetchDocuments(selectedDb, selectedCollection, 1, true, 'manual');
      if (checkFn()) {
        break;
      }
      await new Promise((res) => setTimeout(res, interval));
      attempts++;
    }
    setRefreshingType('');
    setIsLoadingDocuments(false);
  };

  const handleAddDocument = async (doc) => {
    try {
      setIsPostingDocument(true);
      const res = await fetch(`${API_URL}/api/document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connectionString,
          dbName: selectedDb,
          collectionName: selectedCollection,
          doc,
        }),
      });
      const result = await res.json();
      setIsEditModalOpen(false);

      // Use the returned _id if available, otherwise fallback to doc._id
      const newId = result._id || doc._id;
      await pollUntilTableReflects(
        () => documents.some((d) => d._id === newId)
      );
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to add document', 'error');
    } finally {
      setIsPostingDocument(false);
    }
  };

  const handleFetchDocForEdit = async (id) => {
    if (!selectedDb || !selectedCollection || !id) {
      Swal.fire('Error', 'Missing database, collection, or document ID.', 'error');
      return null;
    }
    try {
      const params = new URLSearchParams({
        connectionString: encodeURIComponent(connectionString),
        dbName: encodeURIComponent(selectedDb),
        collectionName: encodeURIComponent(selectedCollection),
        id: encodeURIComponent(id),
      });
      const res = await fetch(`${API_URL}/api/document?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${text}`);
      }
      const doc = await res.json();
      if (!doc || typeof doc !== 'object') {
        throw new Error('Document not found');
      }
      setEditDoc(doc);
      return doc;
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to fetch document', 'error');
      setEditDoc({});
      return null;
    }
  };

  const handleUpdateDocument = async (id, doc) => {
    if (!selectedDb || !selectedCollection || !id) {
      Swal.fire('Error', 'Missing database, collection, or document ID.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/document`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connectionString,
          dbName: selectedDb,
          collectionName: selectedCollection,
          id,
          update: doc,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${text}`);
      }
      Swal.fire('Success', 'Document updated successfully!', 'success');
      setIsEditModalOpen(false);
      await pollUntilTableReflects(
        () => documents.some((d) => d._id === id && d.name === doc.name) // adjust fields as needed
      );
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to update document', 'error');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!selectedDb || !selectedCollection || !id) {
      Swal.fire('Error', 'Missing database, collection, or document ID.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/document`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connectionString,
          dbName: selectedDb,
          collectionName: selectedCollection,
          id,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${text}`);
      }
      Swal.fire('Success', 'Document deleted successfully!', 'success');
      setIsEditModalOpen(false);
      await pollUntilTableReflects(
        () => !documents.some((d) => d._id === id)
      );
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to delete document', 'error');
    }
  };

  const handleRefreshAfterModal = () => {
    fetchDocuments(selectedDb, selectedCollection, 1, true, 'manual');
  };

  const openEditModal = () => {
    if (!connectionString || !selectedDb || !selectedCollection) {
      Swal.fire('Error', 'Please select a database and collection first.', 'error');
      return;
    }
    setIsEditModalOpen(true);
    setModalOperation('create');
    setEditDocId('');
    setEditDoc({});
    setDeleteDocId('');
  };

  return (
    <>
      <style>
        {`
          @keyframes table-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes dot-flash {
            0% { opacity: 1; }
            33% { opacity: 0.5; }
            66% { opacity: 0.2; }
            100% { opacity: 1; }
          }
          .bootstrap-table th, .bootstrap-table td {
            border-bottom: 1px solid #e0e7ff;
          }
          .bootstrap-table tr:last-child td {
            border-bottom: none;
          }
          .bootstrap-table tr.table-row-striped {
            background: #f8fafc;
          }
          .bootstrap-table tr:hover td {
            background: #f1f5fd !important;
          }
          .bootstrap-table .alt-row-even > td, .bootstrap-table .alt-row-even {
            background: #f8fafc !important;
          }
          .bootstrap-table .alt-row-odd > td, .bootstrap-table .alt-row-odd {
            background: #e0e7ff !important;
          }
          .dot-anim {
            display: inline-block;
            animation: dot-flash 1s infinite linear;
          }
        `}
      </style>
      <div
        style={{
          padding: 24,
          background: 'linear-gradient(120deg, #f8f9fa, #e0e7ff)',
          minHeight: '100vh',
        }}
      >
        {/* Top Row: Home Button or Sidebar Toggle + Local Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && columns.length > 0 && !isSidebarVisible ? (
              <button onClick={() => setIsSidebarVisible(true)} style={buttonStyle}>
                <span role="img" aria-label="sidebar" style={{ marginRight: 8 }}>
                  📚
                </span>
                Sidebar
              </button>
            ) : (
              <button onClick={() => navigate('/')} style={buttonStyle}>
                <span role="img" aria-label="home" style={{ marginRight: 8 }}>
                  🏠
                </span>
                Home
              </button>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 'bold',
              fontSize: 16,
              color: '#23272f',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 10,
              padding: '7px 18px',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
              marginLeft: 'auto',
              marginTop: isMobile ? 10 : 0,
            }}
          >
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
                timeZone: userTimezone,
              })}
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              color: 'transparent',
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              fontWeight: 900,
              fontSize: 28,
              margin: 0,
            }}
          >
            Database Explorer
          </h2>
          {columns.length > 0 && !(isMobile && isSidebarVisible) && (
            <div>
              {columns.map((col) => (
                <label
                  key={col}
                  style={{
                    marginRight: 14,
                    fontWeight: 500,
                    fontSize: 15,
                    color: '#23272f',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={columnVisibility[col] ?? true}
                    onChange={() => toggleColumn(col)}
                    style={{ marginRight: 4 }}
                  />
                  Show {col}
                </label>
              ))}
            </div>
          )}
        </div>
        {error && (
          <div style={{ color: '#dc3545', marginBottom: 12, fontWeight: 600 }}>{error}</div>
        )}
        {showSpinner ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
            }}
          >
            <AtlasSpinner />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {/* Sidebar */}
            {(!isMobile || isSidebarVisible) && (
              <div style={sidebarStyle}>
                <div>
                  <h3
                    style={{
                      color: '#fff',
                      marginBottom: 10,
                      marginTop: 0,
                      fontSize: 19,
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    Databases
                  </h3>
                  {paginatedDbs.length > 0 ? (
                    paginatedDbs.map((db) => (
                      <span
                        key={db}
                        style={selectedDb === db ? cardSelected : cardStyle}
                        onClick={() => handleSelectDb(db)}
                        title={db}
                      >
                        <span
                          role="img"
                          aria-label="database"
                          style={{
                            marginRight: 10,
                            fontSize: 18,
                            verticalAlign: 'middle',
                          }}
                        >
                          📁
                        </span>
                        {db}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#fff', fontSize: 15 }}>No databases available</span>
                  )}
                  {totalDbPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                      <button
                        onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                        disabled={dbPage === 1}
                        style={{
                          ...buttonStyle,
                          padding: '4px 14px',
                          fontSize: 14,
                          cursor: dbPage === 1 ? 'not-allowed' : 'pointer',
                          marginRight: 8,
                          opacity: dbPage === 1 ? 0.5 : 1,
                        }}
                      >
                        Prev
                      </button>
                      <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>
                        {dbPage}/{totalDbPages}
                      </span>
                      <button
                        onClick={() => setDbPage((p) => Math.min(totalDbPages, p + 1))}
                        disabled={dbPage === totalDbPages}
                        style={{
                          ...buttonStyle,
                          padding: '4px 14px',
                          fontSize: 14,
                          cursor: dbPage === totalDbPages ? 'not-allowed' : 'pointer',
                          marginLeft: 8,
                          opacity: dbPage === totalDbPages ? 0.5 : 1,
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                {collections.length > 0 && (
                  <div>
                    <h3
                      style={{
                        color: '#fff',
                        margin: '22px 0 10px 0',
                        fontSize: 19,
                        fontWeight: 800,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      Collections
                    </h3>
                    {paginatedCols.map((col) => {
                      const colName = typeof col === 'string' ? col : col.name || String(col);
                      return (
                        <span
                          key={colName}
                          style={selectedCollection === colName ? cardSelected : cardStyle}
                          onClick={() => handleSelectCollection(colName)}
                          title={colName}
                        >
                          <span
                            role="img"
                            aria-label="collection"
                            style={{
                              marginRight: 10,
                              fontSize: 18,
                              verticalAlign: 'middle',
                            }}
                          >
                            📂
                          </span>
                          {colName}
                        </span>
                      );
                    })}
                    {totalColPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                          onClick={() => setColPage((p) => Math.max(1, p - 1))}
                          disabled={colPage === 1}
                          style={{
                            ...buttonStyle,
                            padding: '4px 14px',
                            fontSize: 14,
                            cursor: colPage === 1 ? 'not-allowed' : 'pointer',
                            marginRight: 8,
                            opacity: colPage === 1 ? 0.5 : 1,
                          }}
                        >
                          Prev
                        </button>
                        <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>
                          {colPage}/{totalColPages}
                        </span>
                        <button
                          onClick={() => setColPage((p) => Math.min(totalColPages, p + 1))}
                          disabled={colPage === totalColPages}
                          style={{
                            ...buttonStyle,
                            padding: '4px 14px',
                            fontSize: 14,
                            cursor: colPage === totalColPages ? 'not-allowed' : 'pointer',
                            marginLeft: 8,
                            opacity: colPage === totalColPages ? 0.5 : 1,
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Main Table Area */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                height: 'calc(100vh - 110px)',
              }}
            >
              <div style={{ position: 'relative', width: '100%' }}>
                {columns.length > 0 && (
                  <div style={tableContainerStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        marginTop: 0,
                        width: '100%',
                      }}
                    >
                      <h4
                        style={{
                          color: 'transparent',
                          background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                          WebkitBackgroundClip: 'text',
                          margin: 0,
                          fontWeight: 800,
                          fontSize: 20,
                          textAlign: 'left',
                          width: 'auto',
                          minWidth: 120,
                        }}
                      >
                        Table:{' '}
                        <span
                          style={{
                            color: '#6366f1',
                            background: 'transparent',
                            WebkitBackgroundClip: 'none',
                          }}
                        >
                          {selectedCollection}
                        </span>
                      </h4>
                      <button
                        onClick={openEditModal}
                        style={{
                          ...buttonStyle,
                          padding: '7px 14px',
                          fontSize: 15,
                          height: 38,
                          minWidth: 0,
                          marginLeft: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        title="Edit Table"
                      >
                        <span role="img" aria-label="edit">
                          ✏️
                        </span>
                        {!isMobile && 'Edit'}
                      </button>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginLeft: 16,
                          flex: 1,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <select
                          value={searchField}
                          onChange={(e) => setSearchField(e.target.value)}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 6,
                            border: '1px solid #6366f1',
                            fontSize: 15,
                            fontWeight: 'normal',
                            background: '#fff',
                            color: '#23272f',
                            minWidth: 120,
                            height: 38,
                          }}
                        >
                          <option value="">Filter by...</option>
                          {visibleColumns
                            .filter((col) => col !== 'password')
                            .map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => {
                            if (!searchField) {
                              Swal.fire({
                                icon: 'info',
                                title: 'Select a Filter',
                                text: 'Please select a filter parameter before searching.',
                              });
                            }
                          }}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 4,
                            border: '1px solid #6366f1',
                            fontSize: 15,
                            minWidth: 180,
                            background: '#fff',
                            color: '#23272f',
                            height: 38,
                          }}
                          disabled={!searchField}
                        />
                      </div>
                      <div style={{ marginLeft: 16, display: 'flex', gap: 8 }}>
                        {!isAutoRefreshing ? (
                          <>
                            <button
                              onClick={() =>
                                fetchDocuments(
                                  selectedDb,
                                  selectedCollection,
                                  currentPage,
                                  true,
                                  'manual'
                                )
                              }
                              disabled={isLoadingDocuments || !selectedCollection}
                              style={{
                                ...buttonStyle,
                                padding: '7px 14px',
                                fontSize: 15,
                                height: 38,
                                minWidth: 0,
                                opacity:
                                  isLoadingDocuments || !selectedCollection ? 0.6 : 1,
                                cursor:
                                  isLoadingDocuments || !selectedCollection
                                    ? 'not-allowed'
                                    : 'pointer',
                              }}
                              title="Manual"
                            >
                              {isLoadingDocuments && refreshingType === 'manual' ? (
                                <span>
                                  <span className="dot-anim">Refreshing</span>...
                                </span>
                              ) : (
                                <>
                                  <span
                                    role="img"
                                    aria-label="refresh"
                                    style={{ marginRight: 6 }}
                                  >
                                    🔄
                                  </span>
                                  {!isMobile && 'Manual'}
                                </>
                              )}
                            </button>
                            <button
                              onClick={startAutoRefresh}
                              disabled={isLoadingDocuments || !selectedCollection}
                              style={{
                                ...buttonStyle,
                                padding: '7px 14px',
                                fontSize: 15,
                                height: 38,
                                minWidth: 0,
                                opacity:
                                  isLoadingDocuments || !selectedCollection ? 0.6 : 1,
                                cursor:
                                  isLoadingDocuments || !selectedCollection
                                    ? 'not-allowed'
                                    : 'pointer',
                              }}
                              title="Auto mode"
                            >
                              {isLoadingDocuments && refreshingType === 'auto' ? (
                                <span>
                                  <span className="dot-anim">Auto Refreshing</span>...
                                </span>
                              ) : (
                                <>
                                  <span
                                    role="img"
                                    aria-label="autorefresh"
                                    style={{ marginRight: 6 }}
                                  >
                                    🔁
                                  </span>
                                  {!isMobile && 'Auto'}
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={stopAutoRefresh}
                            style={{
                              ...buttonStyle,
                              padding: '7px 14px',
                              fontSize: 15,
                              height: 38,
                              minWidth: 0,
                            }}
                            title="Stop Auto Refresh"
                          >
                            <span role="img" aria-label="pause" style={{ marginRight: 6 }}>
                              ⏸️
                            </span>
                            {!isMobile && 'Stop Auto Refresh'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        overflowX: 'auto',
                        marginBottom: 12,
                        width: '100%',
                        maxWidth: '100%',
                      }}
                    >
                      <table className="bootstrap-table" style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={thStyle}>#</th>
                            {visibleColumns.map((col) => (
                              <th key={col} style={thStyle}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(searchTerm && searchField ? filteredDocuments : documents).map(
                            (doc, idx) => {
                              const descendingNumber =
                                totalDocuments - ((currentPage - 1) * recordsPerPage + idx);
                              const isEven = idx % 2 === 0;
                              return (
                                <tr
                                  key={doc._id || `${selectedCollection}-${idx}`}
                                  className={isEven ? 'alt-row-even' : 'alt-row-odd'}
                                  style={{
                                    transition: 'background-color 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f0f5';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '';
                                  }}
                                >
                                  <td style={tdStyle}>{descendingNumber}</td>
                                  {visibleColumns.map((col) => (
                                    <td key={col} style={tdStyle}>
                                      {col === 'createdAt' || col === 'updatedAt'
                                        ? doc[col]
                                          ? new Date(doc[col]).toLocaleString(undefined, {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit',
                                              hour12: false,
                                              timeZoneName: 'short',
                                            })
                                          : ''
                                        : String(doc[col]?.toString() || '')}
                                    </td>
                                  ))}
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div
                        style={{
                          marginTop: 0,
                          marginBottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{
                            ...buttonStyle,
                            padding: '7px 18px',
                            marginRight: '8px',
                            fontSize: 15,
                            height: 38,
                            minWidth: 0,
                            opacity: currentPage === 1 ? '0.5' : 1,
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Prev
                        </button>
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: '#6366f1',
                            fontSize: 15,
                          }}
                        >
                          {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          style={{
                            ...buttonStyle,
                            padding: '7px 18px',
                            marginLeft: '8px',
                            fontSize: 15,
                            height: 38,
                            minWidth: 0,
                            opacity: currentPage === totalPages ? '0.5' : 1,
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                    <footer
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        marginTop: 0,
                        padding: '8px 0 8px',
                        color: '#6366f1',
                        fontWeight: 'bold',
                        fontSize: 15,
                        opacity: 0.85,
                        letterSpacing: '0.5px',
                      }}
                    >
                      © {new Date().getFullYear()} All Rights Reserved | ZACKDB
                    </footer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {isEditModalOpen && (
        <CollectionEditModal
          show={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          columns={columns}
          modalOperation={modalOperation}
          setModalOperation={setModalOperation}
          editDocId={editDocId}
          setEditDocId={setEditDocId}
          editDoc={editDoc}
          setEditDoc={setEditDoc}
          deleteDocId={deleteDocId}
          setDeleteDocId={setDeleteDocId}
          setRefreshing={setIsLoadingDocuments}
          connectionString={connectionString}
          dbName={selectedDb}
          collectionName={selectedCollection}
          handleRefreshAfterModal={handleRefreshAfterModal}
        />
      )}
    </>
  );
}

function AtlasSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        width: '100%',
        minHeight: '200px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            width: '64px',
            height: '64px',
            border: '6px solid #6366f1',
            borderTop: '6px solid transparent',
            borderRadius: '50%',
            animation: 'table-spin 0.6s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#6366f1',
            boxShadow: '0 0 6px rgba(129, 140, 248, 0.5)',
          }}
        />
      </div>
      <span
        style={{
          color: '#6366f1',
          fontWeight: 'bold',
          fontSize: 18,
          letterSpacing: '0.5px',
        }}
      >
        Loading...
      </span>
    </div>
  );
}