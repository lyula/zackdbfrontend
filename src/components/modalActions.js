import React from 'react';

export default function CollectionEditModal({
  show,
  onClose,
  columns,
  excludedFields,
  modalOperation,
  setModalOperation,
  editDocId,
  setEditDocId,
  editDoc,
  setEditDoc,
  deleteDocId,
  setDeleteDocId,
  handleAddDocument,
  handleFetchDocForEdit,
  handleUpdateDocument,
  handleDeleteDocument
}) {
  if (!show) return null;

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
          <form onSubmit={e => { e.preventDefault(); handleAddDocument(editDoc); }}>
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
                  required
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
            {!editDocId ? (
              <form onSubmit={e => {
                e.preventDefault();
                handleFetchDocForEdit(editDocId);
              }}>
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
              <form onSubmit={e => { e.preventDefault(); handleUpdateDocument(editDocId, editDoc); }}>
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
                  }}>Update</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* DELETE */}
        {modalOperation === 'delete' && (
          <form onSubmit={e => { e.preventDefault(); handleDeleteDocument(deleteDocId); }}>
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
                background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700
              }}>Delete</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}