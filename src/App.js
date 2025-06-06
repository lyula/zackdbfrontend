import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import MongoConnect from './components/MongoConnect';
import DatabaseExplorer from './components/DatabaseExplorer';
import Dashboard from './components/Dashboard';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setUser(data); });

      fetch(`${API_URL}/api/saved-connections`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setConnections(Array.isArray(data) ? data : []));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} connections={connections} /> : <Navigate to="/login" />} />
        <Route path="/explore" element={<DatabaseExplorer />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;