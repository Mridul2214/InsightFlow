import React, { useEffect, useState } from 'react';
import '../css/adminpage.scss'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalVideos: 0,
    totalBlogs: 0
  });
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState({
    posts: [],
    videos: [],
    blogs: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const getConfig = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const config = getConfig();

      try {
        if (activeTab === 'stats') {
          const statsRes = await axios.get(`${BASE_URL}/api/admin/stats`, config);
          setStats(statsRes.data.data);        
        } else if (activeTab === 'users') {
          const usersRes = await axios.get(`${BASE_URL}/api/admin/users`, config);
          setUsers(usersRes.data.data);
        }
        else {
          const type = activeTab;
          const contentRes = await axios.get(`${BASE_URL}/api/admin/content/${type}`, config);
          setContent(prev => ({ ...prev, [type]: contentRes.data.data }));
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  
useEffect(() => {
  const verifyAdmin = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/adminlogin');
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/admin/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      
      // Remove the hardcoded email check - let backend handle admin validation
      if (!response.data.success) {
        throw new Error('Access denied');
      }
    } catch (err) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/adminlogin'); // Make sure this matches your login route
    }
  };

  verifyAdmin();
}, [navigate]);


  const handleBanUser = async (userId, isBanned) => {
    if (!window.confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`)) return;

    try {
      const config = getConfig();
      await axios.patch(
        `${BASE_URL}/api/admin/users/${userId}`,
        { action: isBanned ? 'unban' : 'ban' },
        config
      );

      setUsers(users.map(user => 
        user._id === userId ? { ...user, isBanned: !isBanned } : user
      ));

      ['posts', 'videos', 'blogs'].forEach(type => {
        axios.get(`${BASE_URL}/api/admin/content/${type}`, config)
          .then(res => {
            setContent(prev => ({ 
              ...prev, 
              [type]: res.data.data 
            }));
          });
      });
    } catch (err) {
      console.error('Ban/unban error:', err);
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleManageContent = async (type, id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this ${type}?`)) return;

    try {
      const config = getConfig();
      await axios.patch(
        `${BASE_URL}/api/admin/content/${type}/${id}`,
        { action },
        config
      );

      const contentRes = await axios.get(`${BASE_URL}/api/admin/content/${type}`, config);
      setContent(prev => ({ ...prev, [type]: contentRes.data.data }));
    } catch (err) {
      console.error(`Manage ${type} error:`, err);
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const renderStats = () => (
    <div className="adminpage-stats-grid">
      <div className="adminpage-stat-card">
        <h3>Total Users</h3>
        <p>{stats.totalUsers}</p>
      </div>
      <div className="adminpage-stat-card">
        <h3>Total Posts</h3>
        <p>{stats.totalPosts}</p>
      </div>
      <div className="adminpage-stat-card">
        <h3>Total Videos</h3>
        <p>{stats.totalVideos}</p>
      </div>
      <div className="adminpage-stat-card">
        <h3>Total Blogs</h3>
        <p>{stats.totalBlogs}</p>
      </div>
    </div>
  );

  const renderUsers = () => {
    if (loading) return <div className="adminpage-loading">Loading users...</div>;
    if (error) return <div className="adminpage-error-message">{error}</div>;
    
    if (!Array.isArray(users)) {
      return (
        <div className="adminpage-error-message">
          Users data is not in expected format. Received: {typeof users}
        </div>
      );
    }
    return (
      <div className="adminpage-table-container">
        {users.length === 0 ? (
          <div className="adminpage-no-data">No users found</div>
        ) : (
          <table className="adminpage-data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    <span className={`adminpage-status ${user.isBanned ? 'adminpage-banned' : 'adminpage-active'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`adminpage-action-btn ${user.isBanned ? 'adminpage-unban' : 'adminpage-ban'}`}
                      onClick={() => handleBanUser(user._id, user.isBanned)}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderContent = (type) => {
    const items = Array.isArray(content[type]) ? content[type] : [];
    
    if (loading) return <div className="adminpage-loading">Loading {type}...</div>;
    if (error) return <div className="adminpage-error-message">{error}</div>;

    return (
      <div className="adminpage-table-container">
        {items.length === 0 ? (
          <div className="adminpage-no-data">No {type} found</div>
        ) : (
          <table className="adminpage-data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isUserBanned = users.find(u => u._id === item.userId)?.isBanned;
                const status = item.isBlocked || isUserBanned ? 'adminpage-blocked' : 'adminpage-active';
                
                return (
                  <tr key={item._id}>
                    <td>{item.title || 'Untitled'}</td>
                    <td className={isUserBanned ? 'adminpage-banned-user' : ''}>
                      {item.userId?.username || 'Unknown'}
                      {isUserBanned && ' (Banned)'}
                    </td>
                    <td>
                      <span className={`adminpage-status ${status}`}>
                        {status === 'adminpage-blocked' ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {/* <button 
                        className={`adminpage-action-btn ${item.isBlocked ? 'adminpage-approve' : 'adminpage-block'}`}
                        onClick={() => handleManageContent(type, item._id, item.isBlocked ? 'approve' : 'block')}
                      >
                        {item.isBlocked ? 'Approve' : 'Block'}
                      </button> */}
                      <button 
                        className="adminpage-action-btn adminpage-delete"
                        onClick={() => handleManageContent(type, item._id, 'delete')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  if (error && error.includes('Access denied')) {
    return (
      <div className="adminpage-admin-container">
        <h1>Admin Dashboard</h1>
        <div className="adminpage-error-message">
          {error}
          <p>Please login with admin credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adminpage-admin-container">
      {/* <h1>Admin Dashboard</h1> */}
      
      <div className="adminpage-tabs">
        <button 
          className={`adminpage-tab ${activeTab === 'stats' ? 'adminpage-active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button 
          className={`adminpage-tab ${activeTab === 'users' ? 'adminpage-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`adminpage-tab ${activeTab === 'posts' ? 'adminpage-active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`adminpage-tab ${activeTab === 'videos' ? 'adminpage-active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </button>
        <button 
          className={`adminpage-tab ${activeTab === 'blogs' ? 'adminpage-active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          Blogs
        </button>
      </div>

      <div className="adminpage-tab-content">
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'posts' && renderContent('posts')}
        {activeTab === 'videos' && renderContent('videos')}
        {activeTab === 'blogs' && renderContent('blogs')}
      </div>
    </div>
  );
};

export default AdminPage;