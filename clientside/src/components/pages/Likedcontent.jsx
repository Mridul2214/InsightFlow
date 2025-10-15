import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/likedcontent.css';

const Likedcontent = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`/api/users/${userId}/liked-content`, config);
        setContent(response.data.data);
      } catch (err) {
        setError(err.message);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleCardClick = (item, type) => {
    if (type === 'post') {
      navigate(`/posts/${item._id}`);
    } else if (type === 'video') {
      navigate(`/videos/${item._id}`);
    } else if (type === 'blog') {
      navigate(`/blogs/${item._id}`);
    }
  };

  const renderContent = () => {
    if (!content) return null;

    const allContent = [
      ...content.posts.map(item => ({ ...item, type: 'post' })),
      ...content.videos.map(item => ({ ...item, type: 'video' })),
      ...content.blogs.map(item => ({ ...item, type: 'blog' }))
    ];

    let filteredContent = allContent;

    if (activeTab === 'posts') {
      filteredContent = content.posts.map(item => ({ ...item, type: 'post' }));
    } else if (activeTab === 'videos') {
      filteredContent = content.videos.map(item => ({ ...item, type: 'video' }));
    } else if (activeTab === 'blogs') {
      filteredContent = content.blogs.map(item => ({ ...item, type: 'blog' }));
    }

    if (filteredContent.length === 0) {
      return (
        <div className="no-content">
          <p>No {activeTab === 'all' ? '' : activeTab} content found</p>
        </div>
      );
    }

    return (
      <div className="content-grid">
        {filteredContent.map((item) => (
          <div
            key={`${item.type}-${item._id}`}
            className="content-card"
            onClick={() => handleCardClick(item, item.type)}
          >
            <div className="card-media">
              {item.type === 'post' && item.image && (
                <img src={item.image} alt={item.title} />
              )}
              {item.type === 'video' && item.thumbnail && (
                <img src={item.thumbnail} alt={item.title} />
              )}
              {item.type === 'blog' && item.coverImage && (
                <img src={item.coverImage} alt={item.title} />
              )}
              {!((item.type === 'post' && item.image) ||
                 (item.type === 'video' && item.thumbnail) ||
                 (item.type === 'blog' && item.coverImage)) && (
                <div className="no-media">
                  <span>{item.type === 'post' ? '📸' : item.type === 'video' ? '🎬' : '✍️'}</span>
                </div>
              )}
            </div>
            <div className="card-content">
              <h3>{item.title}</h3>
              {item.type === 'blog' && item.excerpt && (
                <p>{item.excerpt.substring(0, 100)}...</p>
              )}
              <div className="card-meta">
                <span className="content-type">{item.type}</span>
                <span className="date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="liked-content-page">
        <div className="loading">Loading your liked content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="liked-content-page">
        <div className="error">Error loading content: {error}</div>
      </div>
    );
  }

  const totalCount = content ?
    content.posts.length + content.videos.length + content.blogs.length : 0;

  return (
    <div className="liked-content-page">
      <div className="page-header">
        <h1>Liked Content</h1>
        <p className="total-count">{totalCount} items</p>
      </div>

      <div className="content-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All ({totalCount})
        </button>
        <button
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({content?.posts.length || 0})
        </button>
        <button
          className={activeTab === 'videos' ? 'active' : ''}
          onClick={() => setActiveTab('videos')}
        >
          Videos ({content?.videos.length || 0})
        </button>
        <button
          className={activeTab === 'blogs' ? 'active' : ''}
          onClick={() => setActiveTab('blogs')}
        >
          Blogs ({content?.blogs.length || 0})
        </button>
      </div>

      <div className="content-section">
        {renderContent()}
      </div>
    </div>
  );
};

export default Likedcontent;
