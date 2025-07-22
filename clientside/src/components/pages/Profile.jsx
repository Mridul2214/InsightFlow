import React, { useEffect, useState } from 'react';
import '../css/profile.css';
import { FaSignOutAlt,FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';

  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    profilePic: '',
    bio: '',
    id: ''
  });
  const [tab, setTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
const userData = JSON.parse(localStorage.getItem('user'));
if (!userData) return navigate('/login');

const userId = userData._id || userData.id;
if (!userId) {
  console.error("❌ User ID not found in localStorage object:", userData);
  return navigate('/login');
}

setUser(prev => ({ ...prev, ...userData, id: userId }));


    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      try {
        const [posts, videos, blogs, followersRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/posts/user/${userData._id}`, config),
          axios.get(`${BASE_URL}/api/videos/user/${userData._id}`, config),
          axios.get(`${BASE_URL}/api/blogs/user/${userData._id}`, config),
          // axios.get(`${BASE_URL}/api/users/followers/count/${userData._id}`, config),
        ]);
            try { 
      const followersRes = await axios.get(
        `${BASE_URL}/api/follow/count/${userData._id}`,
        config
      );
      setFollowersCount(followersRes.data.count);
    } catch (followErr) {
      console.error('Followers count error:', followErr);
      setFollowersCount(0); // Default value
    }
        setUserPosts(posts.data);
        setUserVideos(videos.data);
        setUserBlogs(blogs.data);
        // setFollowersCount(followersRes.data.count);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          alert('Session expired. Please log in again.');
          handleLogout();
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const res = await axios.delete(`${BASE_URL}/api/${type}s/${id}`, config);

      if (res.status === 200) {
        if (type === 'post') setUserPosts(prev => prev.filter(item => item._id !== id));
        if (type === 'video') setUserVideos(prev => prev.filter(item => item._id !== id));
        if (type === 'blog') setUserBlogs(prev => prev.filter(item => item._id !== id));
      } else {
        alert(`Could not delete ${type}, try again.`);
      }

    } catch (err) {
      console.error(`Failed to delete ${type}:`, err?.response?.data?.message || err.message);
      alert(`Failed to delete ${type}: ${err?.response?.data?.message || 'Unexpected error'}`);
    }
  };

  const renderContent = () => {
    if (loading) return <p className="no-content-message">Loading your content...</p>;

    if (tab === 'posts') {
      if (userPosts.length === 0) return <p className="no-content-message">No posts found.</p>;
      return (
        <div className="profile-content-grid">
          {userPosts.map(p => (
            <div key={p._id} className="content-card profile-post-card">
              <img
                src={p.image ? `${BASE_URL}/uploads/${p.image}` : 'https://placehold.co/280x160/cccccc/333333?text=No+Image'}
                alt={p.title}
                className="content-media"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/280x160/cccccc/333333?text=Image+Load+Error'; }}
              />
              <div className="card-details">
                <h4>{p.title}</h4>
                <p>{p.description}</p>
                <button className="delete-btn" onClick={() => handleDelete('post', p._id)}>Delete</button>
              </div>
                            <button 
                className="edit-btn"
                onClick={() => navigate(`/edit-post/${p._id}`)}
              >
                <FaEdit /> Edit
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'videos') {
      if (userVideos.length === 0) return <p className="no-content-message">No videos found.</p>;
      return (
        <div className="profile-content-grid">
          {userVideos.map(v => (
            <div key={v._id} className="content-card profile-video-card">
              <video
                className="content-media video-player"
                controls
                src={v.video ? `${BASE_URL}/uploads/videos/${v.video}` : ''}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const img = document.createElement('img');
                  img.src = 'https://placehold.co/280x160/cccccc/333333?text=Video+Error';
                  img.className = 'content-media';
                  e.target.parentNode.appendChild(img);
                }}
              />
              <div className="card-details">
                <h4>{v.title}</h4>
                <button className="delete-btn" onClick={() => handleDelete('video', v._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'blogs') {
      if (userBlogs.length === 0) return <p className="no-content-message">No blogs found.</p>;
      return (
        <div className="profile-content-grid">
          {userBlogs.map(b => (
            <div key={b._id} className="content-card profile-blog-card">
              <div className="card-details">
                <h4>{b.title}</h4>
                <p>{b.content?.slice(0, 150) + '...'}</p>
                <button className="delete-btn" onClick={() => handleDelete('blog', b._id)}>Delete</button>
                                            <button 
                className="edit-btn"
                onClick={() => navigate(`/edit-blog/${b._id}`)}
              >
                <FaEdit /> Edit
              </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
<img
  src={
    user.profilePic
      ? user.profilePic.includes('http') 
        ? user.profilePic 
        : `${BASE_URL}/uploads/profilePics/${user.profilePic}`
      : '/default-profile.png'
  }
  alt="Profile"
  className="profile-pic"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = '/default-profile.png';
  }}
/>

        <div className="user-details">
          <div className="user-main-info">
            <h2>{user.name || 'User Name'}</h2>
            <span className="username">@{user.username || 'username'}</span>
          </div>
          <p className="user-email">{user.email}</p>
          <p className="user-bio">
            {user.bio || "This user hasn't added a bio yet."}
          </p>
          <div className="profile-stats">
            <span><b>{userPosts.length}</b> Posts</span>
            <span><b>{userVideos.length}</b> Videos</span>
            <span><b>{userBlogs.length}</b> Blogs</span>
            <span><b>{followersCount}</b> Followers</span>
          </div>
          <div className="profile-actions">
            <button className="edit-btn" onClick={() => navigate('/edit-profile')}>
              ✏️ Edit Profile
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>Posts</button>
        <button className={tab === 'videos' ? 'active' : ''} onClick={() => setTab('videos')}>Videos</button>
        <button className={tab === 'blogs' ? 'active' : ''} onClick={() => setTab('blogs')}>Blogs</button>
      </div>

      <div className="profile-content-area">
        {renderContent()}
      </div>
    </div>
  );
}
