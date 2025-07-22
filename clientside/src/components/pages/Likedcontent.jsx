import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Likedcontent = () => {
  const { userId } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/${userId}/liked-content`);
        setContent(response.data.data);
      } catch (err) {
        setError(err.message);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <div>Loading content...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!content) return <div>No content found</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Liked Content</h1>
      <h2>Posts</h2>
      {content.posts.map(post => (
        <div key={post._id} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>{post.title}</h3>
          {post.image && <img src={post.image} alt={post.title} style={{ maxWidth: '200px' }} />}
        </div>
      ))}
      
      <h2>Videos</h2>
      {content.videos.map(video => (
        <div key={video._id} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>{video.title}</h3>
          {video.thumbnail && <img src={video.thumbnail} alt={video.title} style={{ maxWidth: '200px' }} />}
        </div>
      ))}
      
      <h2>Blogs</h2>
      {content.blogs.map(blog => (
        <div key={blog._id} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>{blog.title}</h3>
          <p>{blog.excerpt}</p>
        </div>
      ))}
    </div>
  );
};

export default Likedcontent;