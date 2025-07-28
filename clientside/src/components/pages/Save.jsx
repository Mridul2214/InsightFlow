// SavedItems.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SavedItems() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = 'http://localhost:3000';
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/saved`, config);
        setSavedItems(res.data);
      } catch (err) {
        console.error('Error fetching saved items:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedItems();
  }, []);

  const handleRemove = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/saved/${id}`, config);
      setSavedItems(savedItems.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error removing saved item:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="saved-items-container">
      <h1>Saved Items</h1>
      
      {savedItems.length === 0 ? (
        <p>No saved items yet.</p>
      ) : (
        <div className="saved-items-list">
          {savedItems.map(item => (
            <div key={item._id} className="saved-item">
              <div onClick={() => navigate(`/posts/${item.content._id}`)}>
                <h3>{item.content.title}</h3>
                <p>{item.contentType}</p>
              </div>
              <button 
                onClick={() => handleRemove(item._id)}
                className="remove-saved-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}