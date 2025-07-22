import { useState, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000';

export const useInteraction = ({ contentId, contentType }) => {
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const currentUsername = localStorage.getItem('username');

  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/comments/${contentType}/${contentId}`);
      const enriched = await Promise.all(res.data.map(async (c) => {
        try {
          const uRes = await axios.get(`${BACKEND_URL}/api/users/${c.userId}`);
          return { ...c, username: uRes.data.user.username };
        } catch {
          return c;
        }
      }));
      setComments(enriched);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [contentId, contentType]);

  const handleComment = async () => {
    if (!text.trim() || !token || !currentUserId) return;

    try {
      const res = await axios.post(`${BACKEND_URL}/api/comments`, {
        contentId,
        contentType,
        text,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments((prev) => [{
        ...res.data,
        username: currentUsername
      }, ...prev]);

      setText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleReaction = async (type, updateFn) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/${contentType}/${contentId}/${type}`, {
        userId: currentUserId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      updateFn(res.data);
    } catch (err) {
      console.error('Error reacting to content:', err);
    }
  };

  return {
    comments,
    text,
    setText,
    fetchComments,
    handleComment,
    handleReaction,
  };
};
