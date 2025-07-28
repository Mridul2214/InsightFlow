// pages/SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/search.css';

const BASE_URL = 'http://localhost:3000';

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (!q) return;

    setQuery(q);
    axios.get(`${BASE_URL}/api/search?q=${q}`)
      .then(res => setResults(res.data))
      .catch(err => console.error('Search failed:', err));
  }, [location.search]);

  const handleClick = (url) => {
    localStorage.setItem('searchQuery', '');
    window.dispatchEvent(new Event("storage")); // Notifies MainLayout
    navigate(url);
  };



  const renderItem = (item) => {
    const uploader = item.userId?.username || 'Anonymous';
    const timestamp = new Date(item.createdAt || item.timestamp).toLocaleString();

    if (item.contentType === 'video') {
      return (
        <div className="result-card video" onClick={() => handleClick(`/videos/${item._id}`)}>
          <video src={`${BASE_URL}/uploads/${item.videoUrl}`} controls muted className="result-thumb" />
          <div className="result-info">
            <h3>{item.title}</h3>
            <p>{item.description?.slice(0, 100)}...</p>
            <span>By {uploader} • {timestamp}</span>
          </div>
        </div>
      );
    } else if (item.contentType === 'post') {
      return (
        <div className="result-card post" onClick={() => handleClick(`/posts/${item._id}`)}>
          <img src={`${BASE_URL}/uploads/${item.image}`} alt="Post" className="result-thumb" />
          <div className="result-info">
            <h3>{item.title}</h3>
            <p>{item.description?.slice(0, 100)}...</p>
            <span>By {uploader} • {timestamp}</span>
          </div>
        </div>
      );
    } else if (item.contentType === 'blog') {
      return (
        <div className="result-card blog" onClick={() => handleClick(`/blogs/${item._id}`)}>
          <div className="result-info only-text">
            <h3>{item.title}</h3>
            <p>{item.content?.slice(0, 150)}...</p>
            <span>By {uploader} • {timestamp}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="search-page">
      <h2>Search Results for: <span className="query-highlight">"{query}"</span></h2>

      <div className="results-container">
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          results.map((item) => (
            <React.Fragment key={item._id}>
              {renderItem(item)}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
