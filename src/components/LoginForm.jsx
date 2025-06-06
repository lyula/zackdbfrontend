import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
        navigate('/dashboard'); // Redirect to dashboard on success
      } else {
        Swal.fire('Error', data.message || 'Login failed', 'error');
      }
    } catch {
      Swal.fire('Error', 'Server error', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Login</h2>
      <div>
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
      </div>
      <button type="submit" style={{ marginTop: 16 }}>Login</button>
      <div style={{ marginTop: 16 }}>
        Don't have an account? <a href="/register">Register here</a>
      </div>
    </form>
  );
}