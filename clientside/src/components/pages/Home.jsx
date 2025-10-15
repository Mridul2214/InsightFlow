import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/home.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa';
import HistorySidebar from '../pages/HistorySidebar';
import BannedUser from '../BannedUser';


export default function Home() {
  const [allContent, setAllContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [modal, setModal] = useState({ open: false, summary: '', title: '' });
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);
  const [isBanned, setIsBanned] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('viewHistory');
    if (savedHistory) {
      setViewHistory(JSON.parse(savedHistory));
    }
    fetchAll();
    checkBanStatus();
  }, []);

  const checkBanStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:3000/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.isBanned) {
        setIsBanned(true);
      }
    } catch (err) {
      console.error('Failed to check ban status:', err);
    }
  };

  async function fetchAll() {
    try {
      const [p, v, b] = await Promise.all([
        axios.get('http://localhost:3000/api/posts/all'),
        axios.get('http://localhost:3000/api/videos/all'),
        axios.get('http://localhost:3000/api/blogs/all'),
      ]);

      const items = [
        ...p.data.map(item => ({
          ...item,
          type: 'post',
          content: item.description,
        })),
        ...v.data.map(item => ({
          ...item,
          type: 'video',
          content: item.title + ' ' + (item.tag || []).join(' '),
        })),
        ...b.data.map(item => ({
          ...item,
          type: 'blog',
          content: item.content,
        })),
      ];

      const sorted = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllContent(sorted);
      setFilteredContent(sorted);
    } catch (err) {
      console.error('Failed to fetch content:', err);
      setModal({
        open: true,
        summary: 'Could not load content. Please check your network connection and API configurations.',
        title: 'Content Loading Error',
      });
    }
  }

  useEffect(() => {
    if (!allContent || allContent.length === 0) return;

    let contentToShow = [...allContent];

    switch (location.pathname) {
      case '/posts':
        contentToShow = contentToShow.filter(item => item.type === 'post');
        break;
      case '/videos':
        contentToShow = contentToShow.filter(item => item.type === 'video');
        break;
      case '/blogs':
        contentToShow = contentToShow.filter(item => item.type === 'blog');
        break;
    }

    const sort = new URLSearchParams(location.search).get('sort');
    if (sort === 'trending') {
      contentToShow.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredContent(contentToShow);
  }, [location, allContent]);

  const trackContentView = (contentId, contentType, contentTitle) => {
    if (!contentId) return;

    const newHistoryItem = {
      id: contentId,
      type: contentType,
      title: contentTitle,
      timestamp: new Date().toISOString()
    };

    setViewHistory(prev => {
      // Remove if already exists to avoid duplicates
      const filteredHistory = prev.filter(item => item.id !== contentId);
      const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, 50); // Keep last 50 items

      // Save to localStorage immediately
      localStorage.setItem('viewHistory', JSON.stringify(updatedHistory));

      return updatedHistory;
    });
  };

  const handleContentClick = (id, type, title) => {
    trackContentView(id, type, title);
    navigate(`/${type}s/${id}`);
  };

  const summarize = async (item, index) => {
    try {
      setLoadingIndex(index);
      const res = await axios.post(
        'http://localhost:3000/api/ai/summarize',
        { content: item.content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setModal({
        open: true,
        summary: res.data.summary,
        title: item.title || 'Summary',
      });
    } catch (err) {
      setModal({
        open: true,
        summary: err.response?.data?.error || 'Failed to summarize. Please try again.',
        title: 'Summarization Error',
      });
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="home-container">
      <div className="content-grid">
        {filteredContent.map((item, i) => (
          <div key={i} className={`card ${item.type === 'blog' && expandedIndex === i ? 'expanded-blog' : ''}`}>
            {item.type === 'post' && (
              <div className="post-card">
                <div
                  className="clickable-area"
                  onClick={() => handleContentClick(item._id, 'post', item.title)}
                >
                  <img
                    className="card-media"
                    src={`http://localhost:3000/uploads/${item.image}`}
                    alt={item.title}
                  />
                  <div className="card-body">
                    <h4>{item.title}</h4>
                    <p>{item.content}</p>
                  </div>
                </div>
                <button
                  disabled={loadingIndex === i}
                  onClick={(e) => {
                    e.stopPropagation();
                    summarize(item, i);
                  }}
                  className="summarize-btn"
                >
                  {loadingIndex === i ? 'Summarizing...' : 'Summarize with AI'}
                </button>
              </div>
            )}

            {item.type === 'video' && (
              <div className="video-card" onClick={() => handleContentClick(item._id, 'video', item.title)}>
                <video className="card-media" controls>
                  <source src={`http://localhost:3000/uploads/videos/${item.video}`} type="video/mp4" />
                </video>
                <div className="card-body">
                  <h4>{item.title}</h4>
                  <p>{item.content}</p>
                  <button
                    disabled={loadingIndex === i}
                    onClick={(e) => {
                      e.stopPropagation();
                      summarize(item, i);
                    }}
                    className="summarize-btn"
                  >
                    {loadingIndex === i ? 'Summarizing...' : 'Summarize with AI'}
                  </button>
                </div>
              </div>
            )}
            {item.type === 'blog' && (
              <div className="blog-card">
                <div className="card-body" onClick={() => handleContentClick(item._id, 'blog', item.title)}>
                  <h4>{item.title}</h4>
                  <p className={expandedIndex === i ? 'expanded' : 'collapsed'}>
                    {item.content}
                  </p>
                  {item.content.length > 10 && (
                    <button
                      className="read-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedIndex(expandedIndex === i ? null : i);
                      }}
                    >
                      {expandedIndex === i ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                  <button
                    disabled={loadingIndex === i}
                    onClick={(e) => {
                      e.stopPropagation();
                      summarize(item, i);
                    }}
                    className="summarize-btn"
                  >
                    {loadingIndex === i ? 'Summarizing...' : 'Summarize with AI'}
                  </button>
                </div>
              </div>

            )}
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="modal-backdrop" onClick={() => setModal({ open: false, summary: '', title: '' })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{modal.title}</h3>
            <p>{modal.summary || 'Loading summary...'}</p>
            <button onClick={() => setModal({ open: false, summary: '', title: '' })}>Close</button>
          </div>
        </div>
      )}

      {isBanned && <BannedUser />}
    </div>
  );
}
