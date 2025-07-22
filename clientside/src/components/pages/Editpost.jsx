import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/editpost.css';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = 'http://localhost:3000';

  const [formData, setFormData] = useState({
    title: '',
    description: '', // Changed from 'content' to 'description'
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(null);

  // Enhanced error handler
  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    let redirectPath = null;
    let redirectState = {};

    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'Please login to continue';
          redirectPath = '/login';
          redirectState = { from: location };
          break;
        case 403:
          errorMessage = 'You are not authorized to edit this post';
          redirectPath = `/posts/${id}`;
          break;
        case 404:
          errorMessage = 'Post not found or endpoint does not exist';
          redirectPath = '/not-found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection';
      setNetworkError(true);
    } else {
      errorMessage = error.message || errorMessage;
    }

    setError(errorMessage);
    
    if (redirectPath) {
      navigate(redirectPath, { state: redirectState, replace: true });
    }

    return errorMessage;
  };

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const res = await axios.get(`${BASE_URL}/api/posts/${id}`, config);
        
        console.log('API Response:', res.data);

        if (!res.data) {
          throw new Error('Empty response data');
        }

        setFormData({
          title: res.data.title || '',
          description: res.data.description || '', // Using description
          image: null
        });

        if (res.data.image) {
          setCurrentImageUrl(`${BASE_URL}/uploads/${res.data.image}`);
          setImagePreview(`${BASE_URL}/uploads/${res.data.image}`);
        }
        
      } catch (error) {
        handleError(error, 'fetching post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.match('image.*')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB');
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setError(null);
    } catch (error) {
      e.target.value = '';
      handleError(error, 'selecting image');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNetworkError(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description); // Changed to description
      formDataToSend.append('tags', JSON.stringify(['default'])); // Added tags field
      
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      console.log('Submitting:', {
        title: formData.title,
        description: formData.description,
        hasImage: formData.image instanceof File
      });

      const response = await axios.put(
        `${BASE_URL}/api/posts/${id}`,
        formDataToSend,
        config
      );

      console.log('Update success:', response.data);
      
      navigate(`/posts/${id}`, {
        state: { message: 'Post updated successfully' },
        replace: true
      });

    } catch (error) {
      handleError(error, 'updating post');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading post data...</p>
      </div>
    );
  }

  // Error state
  if (error && !formData.title) {
    return (
      <div className="error-container">
        <h2>Error Loading Post</h2>
        <p className="error-message">{error}</p>
        {networkError ? (
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        ) : (
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="edit-post-container">
      <div className="edit-post-header">
        <h1>Edit Post</h1>
        <button 
          className="close-btn" 
          onClick={() => navigate(`/posts/${id}`)}
          disabled={submitting}
        >
          ×
        </button>
      </div>

      {(error || networkError) && (
        <div className={`alert-message ${networkError ? 'network-error' : 'server-error'}`}>
          {error}
          {networkError && (
            <button 
              className="retry-btn small"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          )}
        </div>
      )}

      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label>Content *</label>
          <textarea
            name="description" // Changed from 'content' to 'description'
            value={formData.description}
            onChange={handleChange}
            required
            rows={8}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label>Image</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload" className="file-input-label">
              {formData.image ? 'Change Image' : 'Select Image'}
            </label>
            <span className="file-info">
              {formData.image?.name || 'No file selected'}
            </span>
          </div>
          
          {(imagePreview || currentImageUrl) && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img 
                  src={imagePreview || currentImageUrl} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/cccccc/333333?text=Image+Error';
                  }}
                />
                {imagePreview && !submitting && (
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, image: null }));
                      document.getElementById('image-upload').value = '';
                    }}
                  >
                    
                  </button>
                )}
              </div>
              <p className="image-note">
                {formData.image 
                  ? 'New image selected' 
                  : 'Current post image'}
              </p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={submitting || loading}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate(`/posts/${id}`)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}