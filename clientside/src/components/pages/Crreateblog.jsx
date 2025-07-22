import React, { useState } from 'react';
import '../css/createblog.css'; // You'll need to create this file
import axios from 'axios';
import { FaBlog, FaPaperPlane } from 'react-icons/fa'; // Icons for blog and submit

const Createblog = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '', // Blog content will be a larger text area
    tags: '',
  });

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [tagLoading, setTagLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // No file handling here as blogs typically don't have a single "file" upload like image/video
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.content) {
      setMessage('Title and Content are required.');
      return;
    }

    // Create a plain object for blog data (no FormData needed as no file upload)
    const data = {
      title: formData.title,
      content: formData.content,
      tags: formData.tags, // Send tags as a comma-separated string
    };

    try {
      setIsSubmitting(true); // Set submitting state
      const token = localStorage.getItem('token');
      
      // Use application/json content type for plain JSON body
      const res = await axios.post('http://localhost:3000/api/blogs/upload', data, {
        headers: {
          'Content-Type': 'application/json', // IMPORTANT: Changed to application/json
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('✅ Blog uploaded successfully!');
      // Reset form fields after successful upload
      setFormData({ title: '', content: '', tags: '' });
    } catch (err) {
      console.error('Upload Error:', err);
      setMessage(err.response?.data?.message || '❌ Blog failed to upload.');
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

    const handleAITags = async () => {
  try {
    setTagLoading(true); // Start loading
    const res = await axios.post('http://localhost:3000/api/ai/tags', {
      title: formData.title,
    });

    setFormData(prev => ({
      ...prev,
      tags: res.data.tags || '',
    }));
  } catch (error) {
    console.error("AI tag suggestion error:", error);
  } finally {
    setTagLoading(false); // Stop loading
  }
};

  return (
    <div className="create-blog-page"> {/* Main container for the page */}
      <div className="blog-upload-card"> {/* Central card for the form */}
        <h2 className="card-title">Create a New Blog Post</h2>
        <form onSubmit={handleSubmit} className="create-blog-form">

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="blog-title">Blog Title</label>
            <input
              type="text"
              id="blog-title"
              name="title"
              placeholder="A captivating title for your blog"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Content Textarea */}
          <div className="form-group">
            <label htmlFor="blog-content">Blog Content</label>
            <textarea
              id="blog-content"
              name="content"
              placeholder="Start writing your amazing blog post here..."
              value={formData.content}
              onChange={handleChange}
              rows="15" // Generous rows for blog content
              required
              className="form-textarea"
            />
          </div>

          {/* Tags Input */}
          <div className="form-group">
            <label htmlFor="blog-tags">Tags</label>
            <input
              type="text"
              id="blog-tags"
              name="tags"
              placeholder="e.g., #webdev, #lifestyle, #tech (comma separated)"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          
            <button onClick={handleAITags} disabled={tagLoading} className="ai-btn">
    {tagLoading ? 'Generating Tags...' : 'Suggest Tags'}
  </button>
          
          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            <FaPaperPlane /> {isSubmitting ? 'Publishing...' : 'Publish Blog'}
          </button>

          {/* Message Display */}
          {message && <p className={`form-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Createblog;