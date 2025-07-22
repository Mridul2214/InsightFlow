import React, { useRef, useState } from 'react';
import axios from 'axios';
import '../css/createvideo.css'; // Make sure this file exists and contains the CSS below
import { FaFileUpload, FaPaperPlane, FaTimes, FaVideo } from 'react-icons/fa'; // Added icons

export default function Createvideo() {
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    video: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
    const [tagLoading, setTagLoading] = useState(false);
  

  // Ref to access the file input
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    if (e.target.name === 'video') {
      setFormData({ ...formData, video: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // New function to clear the selected video file
  const clearVideo = () => {
    setFormData((prev) => ({ ...prev, video: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input visually
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.video) {
      setMessage('Title and video file are required.');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('tags', formData.tags);
    data.append('video', formData.video);

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      const res = await axios.post('http://localhost:3000/api/videos/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('✅ Video uploaded successfully!');

      // Reset form and file input
      setFormData({ title: '', tags: '', video: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload Error:', err);
      setMessage(err.response?.data?.message || '❌ Failed to upload video.');
    } finally {
      setIsSubmitting(false);
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
    <div className='create-video-page'> {/* Main container for the page */}
      <div className="video-upload-card"> {/* Central card for the form */}
        <h2 className="card-title">Upload a New Video</h2>
        <form onSubmit={handleSubmit} className="create-video-form">

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title">Video Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Give your video a compelling title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Tags Input */}
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="e.g., #tutorial, #vlog, #coding (comma separated)"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
            />
          </div>

                      <button onClick={handleAITags} disabled={tagLoading} className="ai-btn">
    {tagLoading ? 'Generating Tags...' : 'Suggest Tags'}
  </button>

          {/* Video File Upload Input */}
          <div className="form-group file-upload-group">
            <label htmlFor="video-upload" className="file-upload-label">
              <FaFileUpload className="upload-icon" /> Choose Video File
              {/* Display selected file name if available */}
              {formData.video && <span className="file-name">{formData.video.name}</span>}
            </label>
            <input
              type="file"
              id="video-upload"
              name="video"
              accept="video/*" /* Accepts any video format */
              onChange={handleChange}
              ref={fileInputRef} // Assign ref to the actual input
              required
              className="file-input" // Hidden actual input
            />
            {/* Display video preview if a file is selected */}
            {formData.video && (
              <div className="video-preview-container">
                {/* Note: Direct video preview for local files might not work consistently across browsers
                           without additional setup (e.g., streaming). Showing the file name is more reliable.
                           A simple <video> tag with URL.createObjectURL could work for *some* cases locally.
                           For robust previews, usually you'd upload, get a server URL, then show.
                */}
                <FaVideo className="video-placeholder-icon" />
                <span className="video-preview-text">Selected: {formData.video.name}</span>
                <button type="button" className="clear-video-btn" onClick={clearVideo}>
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            <FaPaperPlane /> {isSubmitting ? 'Uploading...' : 'Upload Video'}
          </button>

          {/* Message Display */}
          {message && <p className={`form-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
}