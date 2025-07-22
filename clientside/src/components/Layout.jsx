import React, { useState, useEffect, useRef } from 'react';
import './css/Layout.css';
import {
  FaHome, FaFire, FaCompass, FaUpload, FaPhone, FaInfoCircle, FaBell,
  FaUserCircle, FaSun, FaMoon, FaFilter, FaVideo, FaImage, FaPen, FaSignInAlt, FaYoutube,
  FaHistory, FaClock, FaThumbsUp, FaRegListAlt, FaPlayCircle
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const toggleTheme = () => setDarkMode(!darkMode);
  const [activeFilter, setActiveFilter] = useState('');
  const location = useLocation();
const [query, setQuery] = useState('');

    // const { currentUser } = useAuth(); // Get current user from your auth context

  // const handleClick = () => {
  //   if (!currentUser) {
  //     navigate('/login'); // Redirect to login if not authenticated
  //     return;
  //   }
  //   navigate(`/users/${currentUser._id}/liked-content`);
  // };

  const navigate = useNavigate();
  const filterDropdownRef = useRef(null);

  // Set active filter based on URL
  useEffect(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    if (path === '/posts') {
      setActiveFilter('posts');
    } else if (path === '/videos') {
      setActiveFilter('videos');
    } else if (path === '/blogs') {
      setActiveFilter('blogs');
    // } else if (searchParams.get('sort') === 'popular') {
    //   setActiveFilter('popular');
    } else if (searchParams.get('sort') === 'recent') {
      setActiveFilter('recent');
    } else if (searchParams.get('sort') === 'trending') {
      setActiveFilter('trending');
    } else {
      setActiveFilter('');
    }
  }, [location]);

  const login = () => { navigate('/login'); };
  const profile = () => { navigate('/profile'); };
  const post = () => { navigate('/createpost'); };
  const home = () => { 
    setActiveFilter('');
    navigate('/'); 
  };
  const video = () => { navigate('/createvideo'); };
  const createBlog = () => { navigate('/createblog'); };
  const contact = () => { navigate('/contact'); };
  const about = () => navigate('/about');

  useEffect(() => {
    if (localStorage.getItem('user')) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterDropdownRef]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setIsFilterDropdownOpen(false);

    switch (filter) {
      case 'posts':
        navigate('/posts');
        break;
      case 'videos':
        navigate('/videos');
        break;
      case 'blogs':
        navigate('/blogs');
        break;
      case 'popular':
        navigate('/?sort=popular');
        break;
      case 'recent':
        navigate('/?sort=recent');
        break;
      case 'trending':
        navigate('/?sort=trending');
        break;
      default:
        navigate('/');
    }
  };

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, 300); // debounce to avoid firing too fast on every keystroke

  return () => clearTimeout(delayDebounce);
}, [query, navigate]);


  return (
    <div className={darkMode ? 'dark-theme' : 'light-theme'}>
      <nav className="main-navbar">
        <button className="logo" onClick={home}>
          <FaYoutube style={{ marginRight: '6px' }} /> 
          <span className="logo-text">InsightFlow</span>
        </button>

    <div className="search-bar">
<input
  type="text"
  className="search-input"
  placeholder="Search 🔍"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>

      {/* <button className="search-btn" onClick={handleSearch}>
        🔍
      </button> */}
    </div>

        <div className="nav-right">
          {/* <button className="nav-btn create-btn" onClick={login}>
            <b>Login</b>
          </button> */}

          <button className="nav-btn">
            <FaBell />
          </button>

          <label className="switch">
            <input type="checkbox" onChange={toggleTheme} checked={darkMode} />
            <span className="slider round">
              {darkMode ? <FaMoon className="mode-icon fa-moon" /> : <FaSun className="mode-icon fa-sun" />}
            </span>
          </label>

          {isLoggedIn ? (
            <button className="nav-btn profile-icon-btn" onClick={profile}>
              <FaUserCircle />
            </button>
          ) : (
            <button className="login-btn" onClick={login}>
              <FaSignInAlt /> <span>Sign In</span>
            </button>
          )}

          <div className="dropdown" ref={filterDropdownRef}>
            <button className="nav-btn" onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}>
              <FaFilter />
            </button>
            <div className="dropdown-content" style={{ display: isFilterDropdownOpen ? 'block' : 'none' }}>
              <button onClick={() => handleFilterChange('posts')} className={activeFilter === 'posts' ? 'activeFilter' : ''}>
                <FaImage /> Posts
              </button>
              <button onClick={() => handleFilterChange('videos')} className={activeFilter === 'videos' ? 'activeFilter' : ''}>
                <FaVideo /> Videos
              </button>
              <button onClick={() => handleFilterChange('blogs')} className={activeFilter === 'blogs' ? 'activeFilter' : ''}>
                <FaPen /> Blogs
              </button>
              <hr />
              <button 
                onClick={() => handleFilterChange('recent')} 
                className={location.search.includes('recent') ? 'activeFilter' : ''}
              >
                Recent
              </button>
              {/* <button 
                onClick={() => handleFilterChange('popular')} 
                className={location.search.includes('popular') ? 'activeFilter' : ''}
              >
                Popular
              </button> */}
            </div>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <aside className="main-sidebar">
          <button onClick={home}><FaHome /> <span>Home</span></button>
{/* <button 
  onClick={() => handleFilterChange('trending')}
  className={location.search.includes('trending') ? 'activeFilter' : ''}
>
  <FaFire /> <span>Trending</span>
</button> */}
          {/* <button><FaCompass /> <span>Explore</span></button> */}
          <hr />
          {/* <button><FaRegListAlt /> <span>Library</span></button> */}

<button onClick={() => navigate('/history')}>
  <FaHistory /> <span>History</span>
</button>
<button onClick={() => navigate('/your-content')}>
  <FaPlayCircle /> <span>Your Content</span>
</button>
{/* <button onClick={() => navigate(`/users/${currentUserId}/liked-content`)}>
  <FaThumbsUp /> 
  <span>Liked contents</span>
</button>         */}
  <hr />
          <button onClick={post}><FaImage /> <span>Create Post</span></button>
          <button onClick={video}><FaVideo /> <span>Create Video</span></button>
          <button onClick={createBlog}><FaPen /> <span>Create Blog</span></button>
          <hr />
          <button onClick={contact}><FaPhone /> <span>Contact</span></button>
          <button onClick={about}><FaInfoCircle /> <span>About</span></button>
          <hr />
          <button onClick={()=> navigate('/subcription')}><FaYoutube /> <span>Subscriptions</span></button>
        </aside>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}