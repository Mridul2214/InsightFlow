import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', formData);
    const { token, user } = res.data;

    // ✅ Save token
    localStorage.setItem('token', token);

    // ✅ Fetch full user profile using token and user ID
    const profileRes = await axios.get(`http://localhost:3000/api/users/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // ✅ Save full user data to localStorage
    localStorage.setItem('user', JSON.stringify(profileRes.data.user));

    // ✅ Navigate to profile or home
    navigate('/profile');
  } catch (err) {
    setError(err.response?.data?.message || 'Login Failed');
  }
};


  const close = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <button className="close-btn" onClick={close}>×</button>

      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} autoComplete='off'>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          <button type="submit">Login</button>
          {error && <p className='error'>{error}</p>}
        </form>

        <p>
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
