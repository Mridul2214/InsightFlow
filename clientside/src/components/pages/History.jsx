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

// import React, { useState, useEffect } from 'react';
// import { 
//   getHistory, 
//   clearHistory, 
//   removeHistoryItem 
// } from '../utils/historyUtils.js';

// const HistoryPage = ({ userId }) => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const fetchHistory = async () => {
//     if (!userId) return;
//     try {
//       setLoading(true);
//       const data = await getHistory(userId);
//       setHistory(data);
//       setError('');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, [userId]);

//   const handleClearHistory = async () => {
//     if (window.confirm('Are you sure you want to clear your entire history?')) {
//       try {
//         await clearHistory(userId);
//         fetchHistory();
//       } catch (err) {
//         setError(err.message);
//       }
//     }
//   };

//   const handleRemoveItem = async (itemId) => {
//     try {
//       await removeHistoryItem(userId, itemId);
//       fetchHistory();
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   if (!userId) {
//     return (
//       <div className="p-4 max-w-3xl mx-auto">
//         <p className="text-center">Please log in to view your history</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 max-w-3xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Your Viewing History</h2>
      
//       <button
//         onClick={handleClearHistory}
//         disabled={history.length === 0}
//         className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-300"
//       >
//         Clear All History
//       </button>
      
//       {error && <p className="text-red-500 mb-4">{error}</p>}
      
//       {loading ? (
//         <p>Loading your history...</p>
//       ) : history.length === 0 ? (
//         <p>No history items found.</p>
//       ) : (
//         <ul className="space-y-3">
//           {history.map(item => (
//             <li key={item._id} className="border p-3 rounded-lg flex justify-between items-center">
//               <div>
//                 <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
//                   {item.contentType}
//                 </span>
//                 <h3 className="font-medium">{item.title}</h3>
//                 <p className="text-sm text-gray-500">
//                   Viewed on {new Date(item.timestamp).toLocaleString()}
//                 </p>
//               </div>
//               <button
//                 onClick={() => handleRemoveItem(item._id)}
//                 className="text-red-500 hover:text-red-700"
//                 title="Remove from history"
//               >
//                 ×
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default HistoryPage;