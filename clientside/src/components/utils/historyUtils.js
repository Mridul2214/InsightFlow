const API_URL = 'http://localhost:5000/api/history';

export const getHistory = async (userId) => {
  const response = await fetch(API_URL, {
    headers: { 'user-id': userId }
  });
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};

export const addToHistory = async (userId, { contentId, contentType, title }) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId
    },
    body: JSON.stringify({ contentId, contentType, title })
  });
  if (!response.ok) throw new Error('Failed to add to history');
  return response.json();
};

export const clearHistory = async (userId) => {
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'user-id': userId }
  });
  if (!response.ok) throw new Error('Failed to clear history');
  return response.json();
};

export const removeHistoryItem = async (userId, itemId) => {
  const response = await fetch(`${API_URL}/${itemId}`, {
    method: 'DELETE',
    headers: { 'user-id': userId }
  });
  if (!response.ok) throw new Error('Failed to remove item');
  return response.json();
};