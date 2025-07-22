import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/editprofile.css';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000';

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    profilePic: null,
    _id: ''
  });
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser({
      name: storedUser.name || '',
      username: storedUser.username || '',
      email: storedUser.email || '',
      bio: storedUser.bio || '',
      profilePic: storedUser.profilePic || null,
      _id: storedUser._id || ''
    });

    // Set preview image if profilePic exists and is a string (not File object)
    if (storedUser.profilePic && typeof storedUser.profilePic === 'string') {
      setPreview(
        storedUser.profilePic.startsWith('http') 
          ? storedUser.profilePic 
          : `${BASE_URL}/uploads/profilePics/${storedUser.profilePic}`
      );
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    if (!file.type.match('image.*')) {
      setError('Please select a valid image file (JPEG, PNG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    setUser({ ...user, profilePic: file });
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const validateForm = () => {
    if (!user.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!user.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(user.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', user.name.trim());
      formData.append('username', user.username.trim());
      formData.append('email', user.email.trim());
      formData.append('bio', user.bio || '');

      if (user.profilePic instanceof File) {
        formData.append('profilePic', user.profilePic);
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/users/update/${user._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update local storage with new user data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user')),
        ...response.data.user
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      navigate('/profile');
    } catch (err) {
      console.error('Update error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="image-preview">
          <img
            src={preview || '/default-profile.png'}
            alt="Profile preview"
            className="edit-profile-pic"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-profile.png';
            }}
          />
          <input 
            type="file" 
            id="profile-upload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="profile-upload" className="upload-btn">
            Change Photo
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={user.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={user.bio}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}