import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/profileview.css';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

export default function ProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';

  // State for user profile data
  const [userData, setUserData] = useState({
    _id: '',
    username: '',
    name: '',
    profilePic: '',
    bio: ''
  });
  
  // State for user content
  const [tab, setTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      if (!userId || userId === 'undefined') {
      setError('Invalid user profile');
      setLoading(false);
      navigate('/not-found');
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. First fetch user profile data - MODIFIED THIS SECTION
        const userResponse = await axios.get(`${BASE_URL}/api/users/${userId}`, { headers });
        
        console.log('User response:', userResponse.data); // Debug log
        
        if (!userResponse.data) {
          throw new Error('User not found');
        }

        // Set user data with PROPER FIELD MAPPING
        setUserData({
          _id: userResponse.data._id || userId,
          // Ensure these fields match your API response structure
          username: userResponse.data.username || userResponse.data.user?.username || 'username',
          name: userResponse.data.name || userResponse.data.user?.name || 'User',
          profilePic: userResponse.data.profilePic || 
                     userResponse.data.user?.profilePic || 
                     '',
          bio: userResponse.data.bio || userResponse.data.user?.bio || 'No bio available'
        });
        // 2. Then fetch all other data in parallel
        const [
          postsResponse,
          videosResponse,
          blogsResponse,
          followersResponse,
          followStatusResponse
        ] = await Promise.all([
          axios.get(`${BASE_URL}/api/posts/user/${userId}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${BASE_URL}/api/videos/user/${userId}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${BASE_URL}/api/blogs/user/${userId}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${BASE_URL}/api/follow/count/${userId}`, { headers }).catch(() => ({ data: { count: 0 } })),
          token ? 
            axios.get(`${BASE_URL}/api/follow/status/${userId}`, { headers }).catch(() => ({ data: { isFollowing: false } })) : 
            Promise.resolve({ data: { isFollowing: false } })
        ]);

        // Update state with fetched data
        setUserPosts(postsResponse.data);
        setUserVideos(videosResponse.data);
        setUserBlogs(blogsResponse.data);
        setFollowersCount(followersResponse.data.count);
        setIsFollowing(followStatusResponse.data.isFollowing);

      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
        
        if (err.response?.status === 404) {
          navigate('/not-found');
        } else if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, navigate]);

const handleFollowToggle = async () => {
  if (!userId || loading) return;

  const wasFollowing = isFollowing;
  
  try {
    // Optimistic UI update
    setIsFollowing(!wasFollowing);
    setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const res = await axios.post(
      `${BASE_URL}/api/follow/toggle`,
      { following: userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Sync with server response
    setIsFollowing(res.data.isFollowing);
    setFollowersCount(res.data.count);

  } catch (err) {
    console.error("Follow toggle failed:", err);
    // Revert on error
    setIsFollowing(wasFollowing);
    setFollowersCount(prev => wasFollowing ? prev + 1 : prev - 1);

    if (err.response?.status === 401) {
      navigate('/login');
    } else if (err.response?.status === 404) {
      setError('User not found');
    } else {
      setError('Failed to update follow status. Please try again.');
    }
  }
};

const renderProfileHeader = () => (
  <div className="profileview-header">
    <div className="profileview-pic-container">
      <img
        src={
          userData.profilePic 
            ? userData.profilePic.includes('http')
              ? userData.profilePic
              : `${BASE_URL}/uploads/${userData.profilePic}`
            : '/default-profile.png'
        }
        alt={`${userData.name}'s profile`}
        className="profileview-pic"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/default-profile.png';
        }}
      />
    </div>

    <div className="profileview-info">
      <h2>{userData.name}</h2>
      <p className="profileview-username">@{userData.username}</p>
      <p className="profileview-bio">{userData.bio}</p>

      <div className="profileview-stats">
        <div className="profileview-stat-item">
          <span className="profileview-stat-number">{userPosts.length}</span>
          <span className="profileview-stat-label">Posts</span>
        </div>
        <div className="profileview-stat-item">
          <span className="profileview-stat-number">{userVideos.length}</span>
          <span className="profileview-stat-label">Videos</span>
        </div>
        <div className="profileview-stat-item">
          <span className="profileview-stat-number">{userBlogs.length}</span>
          <span className="profileview-stat-label">Blogs</span>
        </div>
        <div className="profileview-stat-item">
          <span className="profileview-stat-number">{followersCount}</span>
          <span className="profileview-stat-label">Followers</span>
        </div>
      </div>

      <button
        className={`profileview-follow-btn ${isFollowing ? 'profileview-following' : ''}`}
        onClick={handleFollowToggle}
        disabled={loading}
      >
        {loading ? (
          'Processing...'
        ) : isFollowing ? (
          <>
            <FaUserCheck /> Following
          </>
        ) : (
          <>
            <FaUserPlus /> Follow
          </>
        )}
      </button>
    </div>
  </div>
);

const renderContent = () => {
  const content = {
    posts: userPosts,
    videos: userVideos,
    blogs: userBlogs
  }[tab] || [];

  if (content.length === 0) {
    return <div className="profileview-no-content">No {tab} available</div>;
  }

  return (
    <div className="profileview-content-grid">
      {content.map(item => (
        <div
          key={item._id}
          className={`profileview-content-item profileview-${tab}-item`}
          onClick={() => navigate(`/${tab}/${item._id}`)}
        >
          {tab === 'posts' && (
            <>
              <img
                src={item.image ? `${BASE_URL}/uploads/${item.image}` : '/default-post.png'}
                alt={item.title}
                className="profileview-content-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-post.png';
                }}
              />
              <div className="profileview-content-info">
                <h4>{item.title}</h4>
                <p>{item.description?.substring(0, 100)}</p>
              </div>
            </>
          )}

          {tab === 'videos' && (
            <>
              <div className="profileview-video-thumbnail">
                <img
                  src={item.thumbnail || '/default-video.png'}
                  alt={item.title}
                  className="profileview-thumbnail-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-video.png';
                  }}
                />
                <div className="profileview-play-icon">▶</div>
              </div>
              <div className="profileview-content-info">
                <h4>{item.title}</h4>
              </div>
            </>
          )}

          {tab === 'blogs' && (
            <div className="profileview-blog-content">
              <h4>{item.title}</h4>
              <p>{item.content?.substring(0, 150) + '...'}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

if (loading) {
  return <div className="profileview-loading-spinner">Loading profile...</div>;
}

if (error) {
  return (
    <div className="profileview-error-container">
      <p className="profileview-error-message">{error}</p>
      <button 
        className="profileview-retry-btn"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );
}

return (
  <div className="profileview-container">
    {renderProfileHeader()}

    <div className="profileview-content-tabs">
      <button
        className={`profileview-tab-btn ${tab === 'posts' ? 'profileview-active' : ''}`}
        onClick={() => setTab('posts')}
      >
        Posts
      </button>
      <button
        className={`profileview-tab-btn ${tab === 'videos' ? 'profileview-active' : ''}`}
        onClick={() => setTab('videos')}
      >
        Videos
      </button>
      <button
        className={`profileview-tab-btn ${tab === 'blogs' ? 'profileview-active' : ''}`}
        onClick={() => setTab('blogs')}
      >
        Blogs
      </button>
    </div>

    <div className="profileview-main-content">
      {renderContent()}
    </div>
  </div>
);
}