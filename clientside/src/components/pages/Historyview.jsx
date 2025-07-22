// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaHistory, FaClock, FaArrowLeft, FaTrash } from 'react-icons/fa';
// import '../css/HistoryView.css'

// export default function HistoryView() {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadHistory = () => {
//       const savedHistory = localStorage.getItem('viewHistory');
//       if (savedHistory) {
//         setHistory(JSON.parse(savedHistory));
//       }
//     };

//     loadHistory();
    
//     // Listen for changes from other tabs
//     window.addEventListener('storage', loadHistory);
//     return () => window.removeEventListener('storage', loadHistory);
//   }, []);

//   const clearHistory = () => {
//     if (window.confirm("Are you sure you want to clear your viewing history?")) {
//       localStorage.removeItem('viewHistory');
//       setHistory([]);
//     }
//   };

//   return (
//     <div className="history-view-page">
//       <div className="history-header">
//         <button onClick={() => navigate(-1)} className="back-button">
//           <FaArrowLeft /> Back
//         </button>
//         <h1><FaHistory /> Viewing History</h1>
//         {history.length > 0 && (
//           <button onClick={clearHistory} className="clear-history">
//             <FaTrash /> Clear All
//           </button>
//         )}
//       </div>

//       {history.length === 0 ? (
//         <div className="empty-history">
//           <p>No viewing history yet</p>
//           <p>Content you view will appear here</p>
//         </div>
//       ) : (
//         <div className="history-list">
//           {history.map((item, index) => (
//             <div 
//               key={`${item.id}-${index}`}
//               className="history-item"
//               onClick={() => navigate(`/${item.type}s/${item.id}`)}
//             >
//               <div className="item-content">
//                 <h3>{item.title || 'Untitled Content'}</h3>
//                 <div className="item-meta">
//                   <span className="item-type">{item.type}</span>
//                   <span className="item-date">
//                     <FaClock /> Viewed: {new Date(item.timestamp).toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHistory, FaClock, FaArrowLeft, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import '../css/HistoryView.css';

export default function HistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    if (window.confirm("Clear your entire history?")) {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory([]);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="history-view-page">
      <div className="history-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <h1><FaHistory /> Viewing History</h1>
        {history.length > 0 && (
          <button onClick={clearHistory} className="clear-history">
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <p>No viewing history yet</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div
              key={item._id}
              className="history-item"
              onClick={() => navigate(`/${item.contentType}s/${item.contentId}`)}
            >
              <div className="item-content">
                <h3>{item.title || 'Untitled'}</h3>
                <div className="item-meta">
                  <span className="item-type">{item.contentType}</span>
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
