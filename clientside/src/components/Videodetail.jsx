 import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/videodetail.css';

export default function VideoDetail() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3000';
  
  const [video, setVideo] = useState(null);
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
  const fetchVideoData = async () => {
    try {

      const videoRes = await axios.get(`${BASE_URL}/api/videos/${videoId}`);
      // console.log("API Response:", videoRes.data);
      setVideo(videoRes.data);
      // Fetch reactions
      const reactionsRes = await axios.get(`${BASE_URL}/api/reactions/${videoRes.data._id}`);
      setLikes(reactionsRes.data.likes);
      setDislikes(reactionsRes.data.dislikes);

      // Fetch follow data if video has a user
      if (videoRes.data.userId?._id) {
        try {
const followerRes = await axios.get(
  `${BASE_URL}/api/follow/count/${videoRes.data.userId._id}`
);
setFollowerCount(followerRes.data.count);

          if (user) {
            const followRes = await axios.get(
              `${BASE_URL}/api/follow/status/${videoRes.data.userId._id}`,
              config
            );
            setIsFollowing(followRes.data.isFollowing);
          }
        } catch (apiErr) {
            console.error('API error:', apiErr);
            setFollowerCount(0);
            setIsFollowing(false);
          setFollowerCount(0);
          setIsFollowing(false);
        }
      }
    } catch (err) {
      console.error('Error fetching video:', err);
      }
  };

  fetchVideoData();
}, [videoId, token]);

  useEffect(() => {
    if (!video?._id) return;

    const fetchComments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/comments/${videoId}`);
        setComments(res.data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    };

    fetchComments();
  }, [videoId, video?._id]);

  const handleReaction = async (reactionType) => {
    if (!user) {
      alert('Please login to react');
      return;
    }

    // Optimistic UI update
    if (reactionType === 'like') {
      setLikes(prev => prev + 1);
    } else {
      setDislikes(prev => prev + 1);
    }

    try {
      await axios.post(`${BASE_URL}/api/reactions/toggle`, {
        contentId: video._id,
        contentType: 'video',
        type: reactionType,
      }, config);

      // Re-fetch to sync with backend
      const res = await axios.get(`${BASE_URL}/api/reactions/${video._id}`);
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

  useEffect(()=>{
const fetchFollowData=async()=>{
  try{
    if(!video?.userId._id)return;
    console.log('fetching follow data for:',video.userId._id);
    const countRes= await axios.get(`${BASE_URL}/api/follow/count/${video.userId._id}`);
    console.log('follow count response:' ,countRes.data);
    setFollowerCount(countRes.data.count);
    if (user?._id){
      const statusRes=await axios.get(
        `${BASE_URL}/api/follow/status/${video.userId.id}`,
        {
          headers:{Authorization:`Bearer ${token}`}
        }
      );
      console.log('follow status response:',statusRes.data);
      setIsFollowing(statusRes.data.isFollowing);
    }
  }catch (err) {
      console.error("API Error Details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      }
};
fetchFollowData();
  },[video?.userId?._id,user?._id,token]);


  const handleFollow = async () => {
    if (!video?.userId?._id || isLoading) return;

    setIsLoading(true);
    const wasFollowing = isFollowing;

    try {
      // Optimistic update
      setIsFollowing(!wasFollowing);
      setFollowerCount(prev => wasFollowing ? prev + 1 : prev - 1);

      const res = await axios.post(
        `${BASE_URL}/api/follow/toggle`,
        { following: video.userId._id },
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
        contentId: videoId,
        contentType: 'video',
        comment: newComment,
      }, config);

      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Comment submit error:', err);
    }
  };

  const navigateToUserProfile = () => {

    console.log('video object:', video);
  
  const uploaderId = 
    video?.uploader?._id || 
    video?.userId?._id || 
    video?.user?._id || 
    video?.userId;
  
  console.log('Extracted uploader ID:', uploaderId); // Debug log
  
  if (uploaderId) {
    navigate(`/profile/${uploaderId}`);
  } else {
    console.error("No uploader/user ID found in post:", post);
    alert("Couldn't find user profile");
  }
};

useEffect(() => {
  const saveVideoToHistory = async () => {
    if (!video?._id || !video.title) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        'http://localhost:3000/api/history',
        {
          contentId: video._id,
          contentType: 'video',
          title: video.title,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Also update localStorage for sidebar & history view
      const localHistory = JSON.parse(localStorage.getItem('viewHistory')) || [];
      const newEntry = {
        id: video._id,
        type: 'video',
        title: video.title,
        timestamp: Date.now(),
      };

      const updatedHistory = [newEntry, ...localHistory.filter(item => item.id !== video._id)];
      localStorage.setItem('viewHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Error saving video to history:', err.response?.data || err.message);
    }
  };

  saveVideoToHistory();
}, [video?._id, video?.title]);



  if (!video) return <div className="loading">Loading...</div>;

return (
    <div className="video-container">
      <div className="video-content">
        <video
          controls
          autoPlay
          src={`${BASE_URL}/uploads/videos/${video.video}`}
          className="video-element"
        />
        <h2>{video.title}</h2>
        <p className="video-description">{video.description}</p>

        <div className="video-reactions">
          <button
            onClick={() => handleReaction('like')}
            className={`video-reaction-btn ${likes > 0 ? 'active' : ''}`}
          >
            👍 {likes}
          </button>
          <button
            onClick={() => handleReaction('dislike')}
            className={`video-reaction-btn ${dislikes > 0 ? 'active' : ''}`}
          >
            👎 {dislikes}
          </button>
        </div>

        <div className="video-uploader">
          <h4 onClick={navigateToUserProfile} className="video-uploader-name clickable">
            Uploaded by: {video.userId?.username || 'Community Member'}
          </h4>
          <p>Followers: {followerCount}</p>
          {user && user._id !== video?.userId?._id && (
            <button
              onClick={handleFollow}
              disabled={isLoading}
              className={`video-follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
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

      <div className="video-comments">
        <h3>Comments ({comments.length})</h3>

        <form onSubmit={handleCommentSubmit} className="video-comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
          />
          <button type="submit" className="video-comment-submit-btn">
            Post Comment
          </button>
        </form>

        <div className="video-comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="video-comment">
                <div className="video-comment-header">
                  <strong
                    onClick={() => navigate(`/profile/${comment.user?._id}`)}
                    className="video-comment-username clickable"
                  >
                    @{comment.user?.username || 'Anonymous'}
                  </strong>
                </div>
                <p className="video-comment-text">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="video-no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}