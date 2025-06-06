import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  // Password strength checker
  const checkStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'Strong';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 'Medium';
    return 'Weak';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'password') setPasswordStrength(checkStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match!', 'error');
      return;
    }
    if (checkStrength(form.password) === 'Weak') {
      Swal.fire('Error', 'Password is too weak!', 'error');
      return;
    }
    try {
      const { username, email, password } = form;
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Success', 'Registration successful! Please log in.', 'success').then(() => {
          navigate('/login');
        });
        setForm({ username: '', email: '', password: '', confirmPassword: '' });
      } else {
        Swal.fire('Error', data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server error', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Register</h2>
      <div>
        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} required />
      </div>
      <div>
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
          />
          <span
            style={{ position: 'absolute', right: 10, top: 8, cursor: 'pointer' }}
            onClick={() => setShowPassword((v) => !v)}
            title={showPassword ? 'Hide' : 'Show'}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <small>Password strength: <b>{passwordStrength}</b></small>
      </div>
      <div>
        <label>Confirm Password</label>
        <div style={{ position: 'relative' }}>
          <input
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <span
            style={{ position: 'absolute', right: 10, top: 8, cursor: 'pointer' }}
            onClick={() => setShowConfirm((v) => !v)}
            title={showConfirm ? 'Hide' : 'Show'}
          >
            {showConfirm ? '🙈' : '👁️'}
          </span>
        </div>
      </div>
      <button type="submit" style={{ marginTop: 16 }}>Register</button>
    </form>
  );
};

export default RegisterForm;