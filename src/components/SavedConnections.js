import Swal from 'sweetalert2';

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will delete the connection string permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });
  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/saved-connections/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Deleted!', 'The connection has been deleted.', 'success');
        // Refresh the list after deletion
        setConnections(connections => connections.filter(conn => conn._id !== id));
      } else {
        Swal.fire('Error', data.error || 'Failed to delete connection.', 'error');
      }
    } catch {
      Swal.fire('Error', 'Failed to delete connection.', 'error');
    }
  }
};

{connections.map(conn => (
  <div key={conn._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
    <button onClick={() => handleUse(conn)} style={{ marginRight: 10 }}>
      Use
    </button>
    <button
      onClick={() => handleDelete(conn._id)}
      style={{
        background: 'none',
        border: 'none',
        color: '#ff5252',
        cursor: 'pointer',
        fontSize: 18
      }}
      title="Delete"
    >
      🗑️
    </button>
    <span style={{ marginLeft: 10, wordBreak: 'break-all' }}>{conn.connectionString}</span>
  </div>
))}