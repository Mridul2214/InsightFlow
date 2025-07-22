import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/blogdetail.css';

export default function BlogDetail() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';
  
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        // Fetch blog with populated user
        const blogRes = await axios.get(`${BASE_URL}/api/blogs/${blogId}`);
        setBlog(blogRes.data);

        if (blogRes.data.userId?._id) {
          try {
            // Get follower count
            const followerRes = await axios.get(
              `${BASE_URL}/api/follow/count/${blogRes.data.userId._id}`
            );
            setFollowerCount(followerRes.data.count);

            // Check follow status if logged in
            if (user) {
              const followRes = await axios.get(
                `${BASE_URL}/api/follow/status/${blogRes.data.userId._id}`,
                config
              );
              setIsFollowing(followRes.data.isFollowing);
            }
          } catch (apiErr) {
            console.error('API error:', apiErr);
            setFollowerCount(0);
            setIsFollowing(false);
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
      }
    };

    fetchBlogData();
  }, [blogId, token]);

  useEffect(() => {
    if (!blog?._id) return;

    const fetchReactions = async () => {
      try {
        const reactions = await axios.get(`${BASE_URL}/api/reactions/${blog._id}`);
        setLikes(reactions.data.likes);
        setDislikes(reactions.data.dislikes);
      } catch (error) {
        console.error('Failed to load reactions:', error);
      }
    };

    fetchReactions();
  }, [blog?._id]);

  const handleReaction = async (reactionType) => {
    if (reactionType === 'like') {
      setLikes(prev => prev + 1);
    } else {
      setDislikes(prev => prev + 1);
    }

    try {
      await axios.post(`${BASE_URL}/api/reactions/toggle`, {
        contentId: blog._id,
        contentType: 'blog',
        type: reactionType,
      }, config);

      const res = await axios.get(`${BASE_URL}/api/reactions/${blog._id}`);
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
    } catch (error) {
      if (reactionType === 'like') {
        setLikes(prev => prev - 1);
      } else {
        setDislikes(prev => prev - 1);
      }
      console.error('Reaction failed:', error);
    }
  };

  useEffect (() => {
    const fetchFollowData = async () => {
      try {
        if (!blog?.userId?._id) return;
              console.log('Fetching follow data for:', blog.userId._id);

        const countRes = await axios.get(
          `${BASE_URL}/api/follow/count/${blog.userId._id}`
        );
              console.log('Follow count response:', countRes.data);

        setFollowerCount(countRes.data.count);

        if (user?._id) {
          const statusRes = await axios.get(
            `${BASE_URL}/api/follow/status/${blog.userId._id}`,
            {
               headers: { Authorization: `Bearer ${token}` } }
          );
                  console.log('Follow status response:', statusRes.data);

          setIsFollowing(statusRes.data.isFollowing);
        }
      } catch (err) {
      console.error("API Error Details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      }
    };
    
    fetchFollowData();
  }, [blog?.userId?._id, user?._id, token]);

  const handleFollow = async () => {
    if (!blog?.userId?._id || isLoading) return;

    setIsLoading(true);
    const wasFollowing = isFollowing;

    try {
      setIsFollowing(!wasFollowing);
      setFollowerCount(prev => wasFollowing ? prev + 1 : prev - 1);

      const res = await axios.post(
        `${BASE_URL}/api/follow/toggle`,
        { following: blog.userId._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsFollowing(res.data.isFollowing);
      setFollowerCount(res.data.count);
    } catch (err) {
      console.error("Follow toggle failed:", err);
      setIsFollowing(wasFollowing);
      setFollowerCount(prev => wasFollowing ? prev + 1 : prev - 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      alert('Please login to comment');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/comments`, {
        contentId: blogId,
        contentType: 'blog',
        comment: newComment,
      }, config);

      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Comment submit error:', err);
    }
  };

  const navigateToUserProfile = () => {
    const authorId = blog.userId?._id;
    if (authorId) {
      navigate(`/profile/${authorId}`);
    } else {
      console.error("No author ID found in blog:", blog);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/comments/${blogId}`);
        setComments(res.data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    };

    fetchComments();
  }, [blogId]);


useEffect(() => {
  const saveBlogToHistory = async () => {
    if (!blog?._id || !blog.title) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        'http://localhost:3000/api/history',
        {
          contentId: blog._id,
          contentType: 'blog',
          title: blog.title,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const localHistory = JSON.parse(localStorage.getItem('viewHistory')) || [];
      const newEntry = {
        id: blog._id,
        type: 'blog',
        title: blog.title,
        timestamp: Date.now(),
      };

      const updatedHistory = [newEntry, ...localHistory.filter(item => item.id !== blog._id)];
      localStorage.setItem('viewHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Error saving blog to history:', err.response?.data || err.message);
    }
  };

  saveBlogToHistory();
}, [blog?._id, blog?.title]);



  if (!blog) return <div className="loading">Loading...</div>;

return (
    <div className="blog-container">
      <div className="blog-content-wrapper">
        <h1 className="blog-title">{blog.title}</h1>
        
        <div className="blog-body" dangerouslySetInnerHTML={{ __html: blog.content }} />
        
        <div className="blog-footer">
          <div className="blog-reactions">
            <button
              onClick={() => handleReaction('like')}
              className={`blog-reaction-btn ${likes > 0 ? 'active' : ''}`}
            >
              👍 {likes}
            </button>
            <button
              onClick={() => handleReaction('dislike')}
              className={`blog-reaction-btn ${dislikes > 0 ? 'active' : ''}`}
            >
              👎 {dislikes}
            </button>
          </div>

          <div className="blog-author">
            <h4 onClick={navigateToUserProfile} className="blog-author-name clickable">
              Written by: {blog.userId?.username || 'Community Member'}
            </h4>
            <p>Followers: {followerCount}</p>
            {user && user._id !== blog?.userId?._id && (
              <button
                onClick={handleFollow}
                disabled={isLoading}
                className={`blog-follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : isFollowing ? (
                  <span>Unfollow</span>
                ) : (
                  <span>Follow</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="blog-comments">
        <h3>Comments ({comments.length})</h3>

        <form onSubmit={handleCommentSubmit} className="blog-comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows="3"
          />
          <button type="submit" className="blog-comment-submit-btn">
            Post Comment
          </button>
        </form>

        <div className="blog-comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="blog-comment">
                <div className="blog-comment-header">
                  <strong
                    onClick={() => navigate(`/profile/${comment.user?._id}`)}
                    className="blog-comment-username clickable"
                  >
                    @{comment.user?.username || 'Anonymous'}
                  </strong>
                </div>
                <p className="blog-comment-text">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="blog-no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}