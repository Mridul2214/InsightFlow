import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/editvideo.css';

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = 'http://localhost:3000';
  const videoRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    tag: []
  });
  const [videoInfo, setVideoInfo] = useState({
    url: null,
    isLoading: true,
    hasError: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);

  const handleVideoState = (newState) => {
    setVideoInfo(prev => ({ ...prev, ...newState }));
  };

  const handleVideoError = () => {
    handleVideoState({ hasError: true, isLoading: false });
    if (videoRef.current) {
      videoRef.current.poster = 'https://placehold.co/600x400?text=Video+Not+Available';
    }
  };

  const handleVideoLoadStart = () => {
    handleVideoState({ isLoading: true, hasError: false });
  };

  const handleVideoLoaded = () => {
    handleVideoState({ isLoading: false, hasError: false });
  };

  // Error handling function
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
          errorMessage = 'You are not authorized to edit this video';
          redirectPath = `/videos/${id}`;
          break;
        case 404:
          errorMessage = 'Video not found';
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

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const res = await axios.get(`${BASE_URL}/api/videos/${id}`, config);
        
        if (!res.data) {
          throw new Error('Empty response data');
        }

        setFormData({
          title: res.data.title || '',
          tag: Array.isArray(res.data.tag) ? res.data.tag.join(', ') : ''
        });

        if (res.data.video) {
          handleVideoState({
            url: res.data.video,
            isLoading: true,
            hasError: false
          });
        } else {
          handleVideoState({
            url: null,
            isLoading: false,
            hasError: false
          });
        }
        
      } catch (error) {
        handleError(error, 'fetching video');
        handleVideoState({ 
          url: null, 
          isLoading: false, 
          hasError: true 
        });
      }
      
    };
    

    fetchVideo();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

      const tagArray = formData.tag.split(',').map(tag => tag.trim()).filter(tag => tag);

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.put(
        `${BASE_URL}/api/videos/${id}`,
        {
          title: formData.title,
          tag: tagArray
        },
        config
      );
      
      navigate(`/videos/${id}`, {
        state: { message: 'Video updated successfully' },
        replace: true
      });

    } catch (error) {
      handleError(error, 'updating video');
    } finally {
      setSubmitting(false);
    }
  };

  if (videoInfo.isLoading && !videoInfo.url) {
    return <div className="loading-container">Loading video data...</div>;
  }

  if (error && !formData.title) {
    return (
      <div className="error-container">
        <h2 className="error-title">Error Loading Video</h2>
        <p className="error-message">{error}</p>
        {networkError ? (
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        ) : (
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="edit-video-page">
      <div className="edit-video-header">
        <h1 className="edit-video-title">Edit Video</h1>
        <button 
          className="close-button"
          onClick={() => navigate(`/videos/${id}`)}
          disabled={submitting}
        >
          ×
        </button>
      </div>

      {(error || networkError) && (
        <div className={`error-message ${networkError ? 'network-error' : ''}`}>
          {error}
          {networkError && (
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          )}
        </div>
      )}

      <form className="edit-video-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

<div className="video-preview-container">
  {videoInfo.url ? (
    <div className="video-wrapper">
      <video
        ref={videoRef}
        controls
        width="100%"
        src={`${BASE_URL}/uploads/videos/${videoInfo.url}`}
        onError={handleVideoError}
        onLoadStart={handleVideoLoadStart}
        onLoadedData={handleVideoLoaded}
        poster={videoInfo.hasError ? 'https://placehold.co/600x400?text=Video+Not+Available' : undefined}
      >
        Your browser does not support the video tag.
      </video>
      {videoInfo.isLoading && !videoInfo.hasError && (
        <div className="video-loading-overlay">Loading video...</div>
      )}
    </div>
  ) : (
    <div className="video-placeholder">
      <p>No video available for this content</p>
    </div>
  )}
</div>

        <div className="form-group">
          <label className="form-label">Tags (comma separated)</label>
          <input
            type="text"
            name="tag"
            className="form-input"
            value={formData.tag}
            onChange={handleChange}
            placeholder="e.g., tutorial, react, javascript"
            disabled={submitting}
          />
          <small className="form-hint">Separate multiple tags with commas</small>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            disabled={submitting || videoInfo.isLoading}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(`/videos/${id}`)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}