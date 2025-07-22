import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/editblog.css';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`http://localhost:3000/api/blogs/${id}`);
        
        if (!response.data) {
          throw new Error('No data received');
        }

        setBlogData({
          title: response.data.title || '',
          content: response.data.content || '',
          tag: Array.isArray(response.data.tag) ? 
                response.data.tag : 
                (response.data.tag || '').split(',').map(t => t.trim()).filter(t => t)
        });

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load blog data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const tagString = e.target.value;
    setBlogData(prev => ({
      ...prev,
      tag: tagString.split(',').map(tag => tag.trim()).filter(tag => tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(
        `http://localhost:3000/api/blogs/${id}`,
        blogData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccessMessage('Blog updated successfully!');
      setTimeout(() => navigate(`/blogs/${id}`), 1500);
      
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  return (
    <div className="edit-blog-container">
      <h1>Edit Blog Post</h1>
      
      {error && (
        <div className="alert error">
          {error}
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="alert success">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={blogData.title}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={blogData.content}
            onChange={handleChange}
            rows="10"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tag">Tags (comma separated)</label>
          <input
            id="tag"
            type="text"
            value={blogData.tag.join(', ')}
            onChange={handleTagsChange}
            placeholder="webdev, programming, react"
            disabled={isSubmitting}
          />
          <p className="hint">Separate multiple tags with commas</p>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-btn"></span>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(`/blogs/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;