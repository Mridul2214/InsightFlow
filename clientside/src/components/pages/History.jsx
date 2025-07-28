import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHistory, FaClock, FaArrowLeft, FaTrash } from 'react-icons/fa';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Load from localStorage
        const localHistory = localStorage.getItem('viewHistory');
        if (localHistory) {
          setHistory(JSON.parse(localHistory));
        }
        
        // Optional: Sync with server
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get('http://localhost:3000/api/history', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHistory(res.data);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your viewing history?")) {
      localStorage.removeItem('viewHistory');
      setHistory([]);
      
      // Optional: Clear server history
      const token = localStorage.getItem('token');
      if (token) {
        axios.delete('http://localhost:3000/api/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="history-page">
      <div className="history-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <h1><FaHistory /> Viewing History</h1>
        <button onClick={clearHistory} className="clear-history">
          <FaTrash /> Clear All
        </button>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <p>No viewing history yet</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="history-item"
              onClick={() => navigate(`/${item.type}s/${item.id}`)}
            >
              <div className="item-content">
                <h3>{item.title || 'Deleted Content'}</h3>
                <div className="item-meta">
                  <span className="item-type">{item.type}</span>
                  <span className="item-date">
                    <FaClock /> {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
