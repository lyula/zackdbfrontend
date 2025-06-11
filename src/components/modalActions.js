import React, { useState } from 'react';
import Swal from 'sweetalert2'; // <-- Import SweetAlert

const excludedFields = ['_id', 'password', 'hash', 'createdAt', 'updatedAt', '__v'];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function LoadingButton() {
  const [dots, setDots] = useState('');
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return (
    <button type="button" disabled style={{
      background: '#6366f1',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '8px 18px',
      fontWeight: 700,
      minWidth: 110,
      opacity: 0.8,
      cursor: 'not-allowed'
    }}>
      Loading{dots}
    </button>
  );
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CollectionEditModal({
  show,
  onClose,
  columns,
  modalOperation,
  setModalOperation,
  editDocId,
  setEditDocId,
  editDoc,
  setEditDoc,
  deleteDocId,
  setDeleteDocId,
  setRefreshing,
  connectionString, // <-- add these
  dbName,
  collectionName,
  // ...other props
}) {
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(false);
  }, [modalOperation, show]);

  function validateForm(doc) {
    for (const col of columns) {
      if (excludedFields.includes(col)) continue;
      if (col.toLowerCase().includes('email')) {
        const value = doc[col] || '';
        if (!isValidEmail(value)) {
          Swal.fire('Invalid Email', `Invalid email in field "${col}"`, 'error');
          return false;
        }
      }
    }
    return true;
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px #6366f144'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 18 }}>Collection Operations</h3>
        {/* Operation Selector */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, marginRight: 12 }}>Operation:</label>
          <select
            value={modalOperation}
            onChange={e => {
              setModalOperation(e.target.value);
              setEditDocId('');
              setEditDoc({});
              setDeleteDocId('');
            }}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #6366f1' }}
          >
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        {/* CREATE */}
        {modalOperation === 'create' && (
          <form onSubmit={async e => {
            e.preventDefault();
            if (!validateForm(editDoc)) return;
            try {
              await handleAddDocument(connectionString, dbName, collectionName, editDoc);
              if (setRefreshing) setRefreshing(true);
              onClose(); // Close modal on success
            } catch (err) {
              onClose(); // Close modal on error
              Swal.fire('Error', err.message || 'Failed to create document', 'error');
            }
          }}>
            {columns.filter(col => !excludedFields.includes(col)).map(col => (
              <div key={col} style={{ marginBottom: 14 }}>
                <label style={{ fontWeight: 600 }}>{col}:</label>
                <input
                  type={col.toLowerCase().includes('email') ? 'email' : 'text'}
                  value={editDoc[col] || ''}
                  onChange={e => setEditDoc({ ...editDoc, [col]: e.target.value })}
                  style={{
                    width: '100%', padding: 8, borderRadius: 6, border: '1px solid #6366f1', marginTop: 4
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={onClose} style={{
                background: '#e5e7eb', color: '#23272f', border: 'none', borderRadius: 6, padding: '8px 18px'
              }}>Cancel</button>
              <button type="submit" style={{
                background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700
              }}>Confirm</button>
            </div>
          </form>
        )}

        {/* UPDATE */}
        {modalOperation === 'update' && (
          <>
            {/* Step 1: Ask for ID and fetch data on confirm */}
            {(!editDocId || !editDoc || Object.keys(editDoc).length === 0) ? (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setLoading(true);
                  try {
                    const fetchedDoc = await handleFetchDocForEdit(connectionString, dbName, collectionName, editDocId);
                    if (fetchedDoc) {
                      setEditDoc(fetchedDoc);
                    }
                  } catch (err) {
                    onClose();
                    Swal.fire('Error', err.message || 'Failed to fetch document', 'error');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 600 }}>Document _id:</label>
                  <input
                    type="text"
                    value={editDocId}
                    onChange={e => setEditDocId(e.target.value)}
                    style={{
                      width: '100%', padding: 8, borderRadius: 6, border: '1px solid #6366f1', marginTop: 4
                    }}
                    required
                    disabled={loading}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  {loading ? (
                    <LoadingButton />
                  ) : (
                    <>
                      <button type="button" onClick={onClose} style={{
                        background: '#e5e7eb', color: '#23272f', border: 'none', borderRadius: 6, padding: '8px 18px'
                      }}>Cancel</button>
                      <button type="submit" style={{
                        background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700
                      }}>Confirm</button>
                    </>
                  )}
                </div>
              </form>
            ) : (
              // Step 2: Show populated fields for editing
              <form onSubmit={async e => {
                e.preventDefault();
                if (!validateForm(editDoc)) return;
                try {
                  await handleUpdateDocument(connectionString, dbName, collectionName, editDocId, editDoc);
                  if (setRefreshing) setRefreshing(true);
                  onClose(); // Close modal on success
                } catch (err) {
                  onClose(); // Close modal on error
                  Swal.fire('Error', err.message || 'Failed to update document', 'error');
                }
              }}>
                {columns.filter(
                  col => !excludedFields.includes(col)
                ).map(col => (
                  <div key={col} style={{ marginBottom: 14 }}>
                    <label style={{ fontWeight: 600 }}>{col}:</label>
                    <input
                      type={col.toLowerCase().includes('email') ? 'email' : 'text'}
                      value={editDoc[col] || ''}
                      onChange={e => setEditDoc({ ...editDoc, [col]: e.target.value })}
                      style={{
                        width: '100%', padding: 8, borderRadius: 6, border: '1px solid #6366f1', marginTop: 4
                      }}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" onClick={onClose} style={{
                    background: '#e5e7eb', color: '#23272f', border: 'none', borderRadius: 6, padding: '8px 18px'
                  }}>Cancel</button>
                  <button type="submit" style={{
                    background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700
                  }}>Update</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* DELETE (fetch doc for delete) */}
        {modalOperation === 'delete' && (
          <>
            {!deleteDocId || !editDoc || Object.keys(editDoc).length === 0 ? (
              <form onSubmit={async e => {
                e.preventDefault();
                try {
                  // Pass all required params!
                  const fetchedDoc = await handleFetchDocForEdit(connectionString, dbName, collectionName, deleteDocId);
                  if (fetchedDoc) {
                    setEditDoc(fetchedDoc);
                  }
                } catch (err) {
                  onClose();
                  Swal.fire('Error', err.message || 'Failed to fetch document', 'error');
                }
              }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 600 }}>Document _id to delete:</label>
                  <input
                    type="text"
                    value={deleteDocId}
                    onChange={e => setDeleteDocId(e.target.value)}
                    style={{
                      width: '100%', padding: 8, borderRadius: 6, border: '1px solid #6366f1', marginTop: 4
                    }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" onClick={onClose} style={{
                    background: '#e5e7eb', color: '#23272f', border: 'none', borderRadius: 6, padding: '8px 18px'
                  }}>Cancel</button>
                  <button type="submit" style={{
                    background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700
                  }}>Confirm</button>
                </div>
              </form>
            ) : (
              <form onSubmit={async e => {
                e.preventDefault();
                try {
                  // Pass all required params!
                  await handleDeleteDocument(connectionString, dbName, collectionName, deleteDocId);
                  if (setRefreshing) setRefreshing(true);
                  onClose(); // Close modal on success
                } catch (err) {
                  onClose(); // Close modal on error
                  Swal.fire('Error', err.message || 'Failed to delete document', 'error');
                }
              }}>
                {columns.filter(col => !excludedFields.includes(col)).map(col => (
                  <div key={col} style={{ marginBottom: 14 }}>
                    <label style={{ fontWeight: 600 }}>{col}:</label>
                    <input
                      type={col.toLowerCase().includes('email') ? 'email' : 'text'}
                      value={editDoc[col] || ''}
                      readOnly
                      style={{
                        width: '100%', padding: 8, borderRadius: 6, border: '1px solid #6366f1', marginTop: 4, background: '#f3f4f6'
                      }}
                      tabIndex={-1}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" onClick={onClose} style={{
                    background: '#e5e7eb', color: '#23272f', border: 'none', borderRadius: 6, padding: '8px 18px'
                  }}>Cancel</button>
                  <button type="submit" style={{
                    background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700
                  }}>Delete</button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

async function handleAddDocument(connectionString, dbName, collectionName, doc) {
  const res = await fetch(`${API_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      connectionString,
      dbName,
      collectionName,
      document: doc // <-- NEST the document here!
    })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create document');
  return await res.json();
}

async function handleFetchDocForEdit(connectionString, dbName, collectionName, id) {
  const params = new URLSearchParams({
    connectionString,
    dbName,
    collectionName,
    id
  });
  const res = await fetch(`${API_URL}/api/document?${params.toString()}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch document');
  return await res.json();
}

async function handleUpdateDocument(connectionString, dbName, collectionName, id, doc) {
  const params = new URLSearchParams({
    connectionString,
    dbName,
    collectionName,
    id
  });
  const res = await fetch(`${API_URL}/api/document?${params.toString()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(doc)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update document');
  return await res.json();
}

async function handleDeleteDocument(connectionString, dbName, collectionName, id) {
  const params = new URLSearchParams({
    connectionString,
    dbName,
    collectionName,
    id
  });
  const res = await fetch(`${API_URL}/api/document?${params.toString()}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete document');
  return await res.json();
}