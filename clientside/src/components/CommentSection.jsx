// src/components/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CommentSection({ contentId, contentType }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/comments/${contentType}/${contentId}`);
        setComments(res.data);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };
    fetchComments();
  }, [contentId, contentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!text.trim()) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/comments`, {
        contentId,
        contentType,
        text,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments([res.data, ...comments]);
      setText('');
    } catch (err) {
      console.error('Failed to post comment:', err.response?.data?.message);
    }
  };

  return (
    <div className="comment-section">
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
      <div className="comment-list">
        {comments.map(c => (
          <div key={c._id} className="comment">
            <b>@{c.user?.username || 'user'}:</b> {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}
