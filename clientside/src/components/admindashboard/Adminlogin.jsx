import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/adminlogin.css'

const AdminLogin = () => {
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await axios.post(`${BASE_URL}/api/admin/login`, formData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    if (response.data.success) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
      navigate('/adminpage');
    } else {
      setError(response.data.error || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    if (err.response) {
      if (err.response.status === 401) {
        setError('Access restricted to admin only');
      } else {
        setError(err.response.data?.error || 'Invalid email or password');
      }
    } else {
      setError('Network error. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>Admin Login</h2>
        {error && <div className="admin-login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="adminlogin-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;