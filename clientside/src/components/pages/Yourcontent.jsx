import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaTrash, FaEdit,FaChevronDown } from 'react-icons/fa';
import '../css/YourContent.css';

export default function YourContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchUserContent = async () => {
      try {
        // 1. Check authentication
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user?._id) {
          navigate('/login');
          return;
        }

        // 2. Fetch content using the same auth pattern as your middleware expects
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Using the same endpoint pattern as your profile page
        const [posts, videos, blogs] = await Promise.all([
          axios.get(`${BASE_URL}/api/posts/user/${user._id}`, config),
          axios.get(`${BASE_URL}/api/videos/user/${user._id}`, config),
          axios.get(`${BASE_URL}/api/blogs/user/${user._id}`, config)
        ]);

        // Combine and sort content
        const combined = [
          ...posts.data.map(p => ({ ...p, type: 'post' })),
          ...videos.data.map(v => ({ ...v, type: 'video' })),
          ...blogs.data.map(b => ({ ...b, type: 'blog' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setContent(combined);
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired or invalid - mirror your middleware response
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to load content');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [navigate]);

  const handleDelete = async (id, type, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete this ${type}?`)) return;

    try {
      await axios.delete(`${BASE_URL}/api/${type}s/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setContent(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(`Failed to delete ${type}: ${err.response?.data?.message || 'Server error'}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading your content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="your-content-container">
      <div className="content-header">
        <h1>Your Content</h1>
<div className="create-new-container">
  <button 
    className="create-new-btn"
    onClick={() => setShowDropdown(!showDropdown)}
  >
    + Create New <FaChevronDown className="dropdown-icon" />
  </button>
  
  {showDropdown && (
    <div className="dropdown-menu">
      <button 
        className="dropdown-item"
        onClick={() => {
          navigate('/createpost');
          setShowDropdown(false);
        }}
      >
        Post
      </button>
      <button 
        className="dropdown-item"
        onClick={() => {
          navigate('/createvideo');
          setShowDropdown(false);
        }}
      >
        Video
      </button>
      <button 
        className="dropdown-item"
        onClick={() => {
          navigate('/createblog');
          setShowDropdown(false);
        }}
      >
        Blog
      </button>
    </div>
  )}
</div>
</div>

      {content.length === 0 ? (
        <div className="empty-content">
          <p>You haven't created any content yet.</p>
          <button onClick={() => navigate('/createpost')}>
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="content-grid">
          {content.map(item => (
            <div 
              key={`${item.type}-${item._id}`}
              className="content-card"
              onClick={() => navigate(`/${item.type}s/${item._id}`)}
            >
              <div className="card-media">
                {item.type === 'post' && item.image && (
                  <img 
                    src={`${BASE_URL}/uploads/${item.image}`} 
                    alt={item.title}
                    onError={(e) => e.target.src = '/default-post.jpg'}
                  />
                )}
                {item.type === 'video' && (
                  <div className="video-thumbnail">
                    <video src={`${BASE_URL}/uploads/videos/${item.video}`} />
                  </div>
                )}
                {item.type === 'blog' && (
                  <div className="blog-icon">✍️</div>
                )}
              </div>

              <div className="card-body">
                <h3>{item.title}</h3>
                <p className="content-description">
                  {item.description || item.content?.substring(0, 100) + '...'}
                </p>
                <div className="card-footer">
                  <span className="content-type">{item.type}</span>
                  <span className="date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <div className="actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-${item.type}/${item._id}`);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => handleDelete(item._id, item.type, e)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}