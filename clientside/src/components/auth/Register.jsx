import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css'
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });
  const [error, setError]= useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Later: Add axios call to backend here
    setError('');
    try{
      await axios.post('http://localhost:3000/api/auth/register', formData);

      navigate('/login'); // redirect to login on success
      
    }catch(err){
      setError(err.response?.data?.message || 'Registration failed')
    }
  };

  const close=()=>{
    navigate('/')
  }

  return (
    <div className="register-container">
    <div className="auth-container">
      <button className="close-btn" onClick={close}>×</button>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
  <input
    type="text"
    name="name"
    placeholder="Full Name"
    value={formData.name}
    onChange={handleChange}
    autoComplete="name"
    required
  />

  <input
    type="text"
    name="username"
    placeholder="Username"
    value={formData.username}
    onChange={handleChange}
    autoComplete="new-username"
    required
  />

  <input
    type="email"
    name="email"
    placeholder="Email"
    value={formData.email}
    onChange={handleChange}
    autoComplete="new-email"
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

        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
      <p onClick={() => navigate('/login')} className="link">Already have an account? Login</p>
      </form>
    </div>
</div>
  );
};

export default Register;
