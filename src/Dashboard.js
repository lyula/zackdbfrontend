import React from 'react';

function Dashboard({
  handleLogout,
  handleCreateDatabase,
  newDbName,
  setNewDbName,
  databases,
  fetchCollections,
  selectedDb,
  collections,
  fetchData,
  selectedCollection,
  data,
  connections = [],
  user
}) {
  // Debug: log connections to see what you get
  console.log('connections:', connections);

  return (
    <div className="main-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Zack Data Platform</h1>
        <button onClick={handleLogout} className="button red-button">Logout</button>
      </div>
      <form onSubmit={handleCreateDatabase} className="create-db-form">
        <input
          type="text"
          placeholder="New Database Name"
          value={newDbName}
          onChange={(e) => setNewDbName(e.target.value)}
          className="input"
        />
        <button type="submit" className="button blue-button">Create Database</button>
      </form>
      <div className="folder-grid">
        {databases.map((db) => (
          <button key={db} onClick={() => fetchCollections(db)} className="folder-button">
            <span className="folder-icon">📁</span> {db}
          </button>
        ))}
      </div>
      {selectedDb && (
        <div className="collections-section">
          <h2 className="section-title">Collections in {selectedDb}</h2>
          <div className="folder-grid">
            {collections.map((col) => (
              <button key={col} onClick={() => fetchData(col)} className="folder-button">
                <span className="folder-icon">📂</span> {col}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedCollection && data.length > 0 && (
        <div className="data-section">
          <h2 className="section-title">Data in {selectedCollection}</h2>
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((doc, index) => (
                <tr key={index}>
                  {Object.values(doc).map((value, i) => (
                    <td key={i}>{JSON.stringify(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="connections-section">
        <h2 className="section-title">Connections</h2>
        <ul className="connections-list">
          {Array.isArray(connections) && connections.length > 0 ? (
            connections.map((conn, idx) => {
              // Defensive: Only render if conn is an object and has a connectionString
              if (
                conn &&
                typeof conn === "object" &&
                typeof conn.connectionString === "string"
              ) {
                return (
                  <li key={conn._id || idx}>
                    <div><strong>Label:</strong> {conn.label || 'No label'}</div>
                    <div><strong>Connection:</strong> {conn.connectionString}</div>
                    <div><small>Saved: {new Date(conn.createdAt).toLocaleString()}</small></div>
                  </li>
                );
              }
              // If conn is not valid, skip rendering
              return null;
            })
          ) : (
            <li>No connections saved.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;