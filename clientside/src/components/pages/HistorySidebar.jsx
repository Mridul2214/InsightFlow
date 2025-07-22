// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaHistory } from 'react-icons/fa';

// export default function HistorySidebar() {
//   const [recentHistory, setRecentHistory] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadHistory = () => {
//       const history = localStorage.getItem('viewHistory');
//       if (history) {
//         setRecentHistory(JSON.parse(history).slice(0, 3));
//       }
//     };

//     loadHistory();
//     window.addEventListener('storage', loadHistory);
//     return () => window.removeEventListener('storage', loadHistory);
//   }, []);

//   return (  
//     <aside className="history-sidebar">
//       <div className="sidebar-header">
//         <FaHistory className="history-icon" />
//         <h3>Recent Views</h3>
//       </div>
      
//       {recentHistory.length > 0 ? (
//         <ul className="history-items">
//           {recentHistory.map((item, index) => (
//             <li 
//               key={index} 
//               className="history-item"
//               onClick={() => navigate(`/${item.type}s/${item.id}`)}
//             >
//               <span className="item-title">{item.title || 'Deleted Content'}</span>
//               <span className="item-type">{item.type}</span>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="empty-message">No recent views</p>
//       )}

//       <button 
//         className="view-all-button"
//         onClick={() => navigate('/history')}
//       >
//         View Full History
//       </button>
//     </aside>
//   );
// }


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa';
import axios from 'axios';

export default function HistorySidebar() {
  const [recentHistory, setRecentHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentHistory(res.data.slice(0, 3));
      } catch (err) {
        console.error('Sidebar history fetch failed', err);
      }
    };

    fetchRecentHistory();
  }, []);

  return (
    <aside className="history-sidebar">
      <div className="sidebar-header">
        <FaHistory className="history-icon" />
        <h3>Recent Views</h3>
      </div>

      {recentHistory.length > 0 ? (
        <ul className="history-items">
          {recentHistory.map((item) => (
            <li
              key={item._id}
              className="history-item"
              onClick={() => navigate(`/${item.contentType}s/${item.contentId}`)}
            >
              <span className="item-title">{item.title}</span>
              <span className="item-type">{item.contentType}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">No recent views</p>
      )}

      <button className="view-all-button" onClick={() => navigate('/history')}>
        View Full History
      </button>
    </aside>
  );
}
