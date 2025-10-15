 import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/postdetail.css';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';
   const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

  const [post, setPost] = useState(null);
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
const fetchPostData = async () => {
  try {
    // Fetch post with populated user
    const postRes = await axios.get(`${BASE_URL}/api/posts/${postId}`);
    setPost(postRes.data);

    if (postRes.data.userId?._id) {
      try {
        // Get follower count
        const followerRes = await axios.get(
          `${BASE_URL}/api/follow/count/${postRes.data.userId._id}`
        );
        setFollowerCount(followerRes.data.count);

        // Check follow status if logged in
        if (user) {
          const followRes = await axios.get(
            `${BASE_URL}/api/follow/status/${postRes.data.userId._id}`,
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
    console.error('Error fetching post:', err);
  }
};

  fetchPostData();
}, [postId, token]);



useEffect(() => {
  if (!post?._id) return; 

  const fetchReactions = async () => {
    try {
      const reactions = await axios.get(`${BASE_URL}/api/reactions/${post._id}`);
      setLikes(reactions.data.likes);
      setDislikes(reactions.data.dislikes);
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  };

  fetchReactions();
}, [post?._id]); 




const handleReaction = async (reactionType) => {
  // Optimistic UI update
  if (reactionType === 'like') {
    setLikes(prev => prev + 1);
  } else {
    setDislikes(prev => prev + 1);
  }

  try {
    await axios.post(`${BASE_URL}/api/reactions/toggle`, {
      contentId: post._id,
      contentType: 'post',
      type: reactionType,
    }, config);

    // Optional: Re-fetch to sync with backend
    const res = await axios.get(`${BASE_URL}/api/reactions/${post._id}`);
    setLikes(res.data.likes);
    setDislikes(res.data.dislikes);
  } catch (error) {
    // Rollback on error
    if (reactionType === 'like') {
      setLikes(prev => prev - 1);
    } else {
      setDislikes(prev => prev - 1);
    }
    console.error('Reaction failed:', error);
  }
};

// Follow data is now handled in fetchPostData above



const handleFollow = async () => {
  if (!post?.userId?._id || isLoading) return;

  setIsLoading(true);
  const wasFollowing = isFollowing;

  try {
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowerCount(prev => wasFollowing ? prev - 1 : prev + 1);

    const res = await axios.post(
      `${BASE_URL}/api/follow/toggle`,
      { following: post.userId._id }, // Only need following ID
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Sync with server response
    setIsFollowing(res.data.isFollowing);
    setFollowerCount(res.data.count);

  } catch (err) {
    console.error("Follow toggle failed:", err);
    // Revert on error
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
        contentId: postId,
        contentType: 'post',
        comment: newComment,
      }, config);

      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Comment submit error:', err);
    }
  };


const navigateToUserProfile = () => {
  // Debug log to check the post object structure
  console.log('Post object:', post);
  
  const uploaderId = 
    post?.uploader?._id || 
    post?.userId?._id || 
    post?.user?._id || 
    post?.userId;
  
  console.log('Extracted uploader ID:', uploaderId); // Debug log
  
  if (uploaderId) {
    navigate(`/profile/${uploaderId}`);
  } else {
    console.error("No uploader/user ID found in post:", post);
    alert("Couldn't find user profile");
  }
};





// Add this useEffect hook to fetch comments when the component mounts
useEffect(() => {
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/comments/${postId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  fetchComments();
}, [postId]); 


useEffect(() => {
  const saveToHistory = async () => {
    if (!post?._id || !post.title) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `${BASE_URL}/api/history`,
        {
          contentId: post._id,
          contentType: 'post',
          title: post.title,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Optional: Also store locally for offline use
      const localHistory = JSON.parse(localStorage.getItem('viewHistory')) || [];
      const newEntry = {
        id: post._id,
        type: 'post',
        title: post.title,
        timestamp: Date.now(),
      };

      // Prevent duplicates
      const updatedHistory = [newEntry, ...localHistory.filter(item => item.id !== post._id)];
      localStorage.setItem('viewHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Error saving to history:', err.response?.data || err.message);
    }
  };

  saveToHistory();
}, [post?._id, post?.title]);


  // useEffect(() => {
  //   const checkIfSaved = async () => {
  //     if (!user || !postId) return;
      
  //     try {
  //       const res = await axios.get(
  //         `${BASE_URL}/api/saved/check/${postId}/post`,
  //         config
  //       );
  //       setIsSaved(res.data.isSaved);
  //     } catch (err) {
  //       console.error('Error checking saved status:', err);
  //     }
  //   };
    
  //   checkIfSaved();
  // }, [postId, user]);

  // // Add this function to handle save/unsave
  // const handleSave = async () => {
  //   if (!user) {
  //     alert('Please login to save posts');
  //     return;
  //   }
    
  //   setSaveLoading(true);
    
  //   try {
  //     if (isSaved) {
  //       // First find the saved item ID (this could be optimized)
  //       const res = await axios.get(
  //         `${BASE_URL}/api/saved/check/${postId}/post`,
  //         config
  //       );
        
  //       if (res.data.isSaved) {
  //         await axios.delete(
  //           `${BASE_URL}/api/saved/${res.data.savedItemId}`,
  //           config
  //         );
  //       }
  //     } else {
  //       await axios.post(
  //         `${BASE_URL}/api/saved`,
  //         { contentId: postId, contentType: 'post' },
  //         config
  //       );
  //     }
      
  //     setIsSaved(!isSaved);
  //   } catch (err) {
  //     console.error('Error toggling save:', err);
  //   } finally {
  //     setSaveLoading(false);
  //   }
  // };


  if (!post) return <div className="loading">Loading...</div>;
return (
    <div className="post-container">
      <div className="post-content">
        <img
          src={`${BASE_URL}/uploads/${post.image}`}
          alt={post.title}
          className="post-image"
        />
        <h2>{post.title}</h2>
        <p className="post-description">{post.description}</p>

        <div className="post-reactions">
          <button
            onClick={() => handleReaction('like')}
            className={`post-reaction-btn ${likes > 0 ? 'active' : ''}`}
          >
            👍 {likes}
          </button>
          <button
            onClick={() => handleReaction('dislike')}
            className={`post-reaction-btn ${dislikes > 0 ? 'active' : ''}`}
          >
            👎 {dislikes}
          </button>
                    {/* <button
            onClick={handleSave}
            disabled={saveLoading}
            className={`post-save-btn ${isSaved ? 'saved' : ''}`}
          >
            {saveLoading ? '...' : isSaved ? 'Saved' : 'Save'}
          </button> */}

        </div>

        <div className="post-uploader">
          <h4 onClick={navigateToUserProfile} className="post-uploader-name clickable">
            Uploaded by: {post.userId?.username ||'Community Member'}
          </h4>
          <p>Followers: {followerCount}</p>
          {user && user._id !== post?.userId?._id && (
            <button
              onClick={handleFollow}
              disabled={isLoading}
              className={`post-follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
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

      <div className="post-comments">
        <h3>Comments ({comments.length})</h3>

        <form onSubmit={handleCommentSubmit} className="post-comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
          />
          <button type="submit" className="post-comment-submit-btn">
            Post Comment
          </button>
        </form>

        <div className="post-comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="post-comment">
                <div className="post-comment-header">
                  <strong
                    onClick={() => navigate(`/profile/${comment.user?._id}`)}
                    className="post-comment-username clickable"
                  >
                    @{comment.user?.username || 'Anonymous'}
                  </strong>
                </div>
                <p className="post-comment-text">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="post-no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}