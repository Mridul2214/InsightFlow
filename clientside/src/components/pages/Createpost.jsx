import React, { useState } from 'react';
import '../css/createpost.css';
import axios from 'axios';
import { FaImage, FaPaperPlane, FaTimes } from 'react-icons/fa';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    image: null,
  });

  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image' && files.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('tags', formData.tags);
    data.append('image', formData.image);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/posts/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('✅ Post uploaded successfully!');
      setFormData({ title: '', description: '', tags: '', image: null });
      setImagePreview(null);
    } catch (err) {
      console.error('Upload Error:', err);
      setMessage(err.response?.data?.message || '❌ Post failed');
    }
  };

 const handleAISuggest = async () => {
  try {
    setLoading(true);
    const res = await axios.post('http://localhost:3000/api/ai/suggest', {
      title: formData.title,
    });

    const generatedText = res.data.description || '';

    // Typing animation
    let index = 0;
    const typeText = () => {
      if (index <= generatedText.length) {
        setFormData((prev) => ({
          ...prev,
          description: generatedText.slice(0, index),
        }));
        index++;
        setTimeout(typeText, 20); // Adjust speed here (lower = faster)
      }
    };

    typeText();
  } catch (error) {
    console.error('AI suggestion error:', error);
  } finally {
    setLoading(false);
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
    <div className="create-post-page">
      <div className="post-card">
        <h2 className="card-title">Create a New Post</h2>

       
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="A catchy title for your post"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>



          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell us more about your post..."
              value={formData.description}
              onChange={handleChange}
              rows="6"
              required
                className={`form-textarea ${loading ? 'typing-effect' : ''}`}
            />
          </div>


          
           <button onClick={handleAISuggest} disabled={loading} className="ai-btn">
          {loading ? 'Generating...' : 'Generate Description'}
        </button>




          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="e.g., #nature, #travel, #photography (comma separated)"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
            />
          </div>

            <button onClick={handleAITags} disabled={tagLoading} className="ai-btn">
    {tagLoading ? 'Generating Tags...' : 'Suggest Tags'}
  </button>

          <div className="form-group file-upload-group">
            <label htmlFor="image-upload" className="file-upload-label">
              <FaImage className="upload-icon" /> Choose Image
              {formData.image && <span className="file-name">{formData.image.name}</span>}
            </label>
            <input
              type="file"
              id="image-upload"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              className="file-input"
            />
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button type="button" className="clear-image-btn" onClick={clearImage}>
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn">
            <FaPaperPlane /> Upload Post
          </button>

          {message && (
            <p className={`form-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

// import React, { useEffect, useState } from 'react';
// import '../css/createpost.css';
// import axios from 'axios';
// import { FaImage, FaPaperPlane, FaTimes } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';

// const CreatePost = () => {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     tags: '',
//     image: null,
//   });

//   const [message, setMessage] = useState('');
//   const [imagePreview, setImagePreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [tagLoading, setTagLoading] = useState(false);
//   const [aiError, setAiError] = useState(null);
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [userEmail, setUserEmail] = useState('');
//   const navigate = useNavigate();

//     useEffect(() => {
//     const checkUserStatus = async () => {
//       const token = localStorage.getItem('token');
//       const email = localStorage.getItem('userEmail');
      
//       if (token && email) {
//         setUserEmail(email);
//         // Special access for mridul1422@gmail.com
//         if (email === 'mridul1422@gmail.com') {
//           setIsSubscribed(true);
//           return;
//         }
        
//         // Check subscription status for other users
//         try {
//           const res = await axios.get('http://localhost:3000/api/users/me', {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           });
//           setIsSubscribed(res.data.isSubscribed);
//         } catch (error) {
//           console.error('Error checking subscription:', error);
//         }
//       }
//     };

//     checkUserStatus();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (name === 'image' && files.length > 0) {
//       setFormData((prev) => ({ ...prev, image: files[0] }));
//       setImagePreview(URL.createObjectURL(files[0]));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const clearImage = () => {
//     setFormData((prev) => ({ ...prev, image: null }));
//     setImagePreview(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data = new FormData();
//     data.append('title', formData.title);
//     data.append('description', formData.description);
//     data.append('tags', formData.tags);
//     data.append('image', formData.image);

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       setLoading(true);
//       const res = await axios.post('http://localhost:3000/api/posts/upload', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setMessage('✅ Post uploaded successfully!');
//       setFormData({ title: '', description: '', tags: '', image: null });
//       setImagePreview(null);
//     } catch (err) {
//       console.error('Upload Error:', err);
//       setMessage(err.response?.data?.message || '❌ Post failed');
//     } finally {
//       setLoading(false);
//     }
//   };
// const handleAISuggest = async () => {
//     if (!isSubscribed) {
//       setAiError('Premium subscription required for AI features');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       if (!formData.title.trim()) {
//         setAiError('Please enter a title first');
//         return;
//       }

//       setLoading(true);
//       setAiError(null);

//       const res = await axios.post(
//         'http://localhost:3000/api/ai/suggest',
//         { title: formData.title },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const generatedText = res.data.description || '';

//       // Typing animation
//       let index = 0;
//       const typeText = () => {
//         if (index <= generatedText.length) {
//           setFormData((prev) => ({
//             ...prev,
//             description: generatedText.slice(0, index),
//           }));
//           index++;
//           setTimeout(typeText, 20);
//         }
//       };

//       typeText();
//     } catch (error) {
//       console.error('AI suggestion error:', error);
//       if (error.response) {
//         if (error.response.status === 401) {
//           setAiError('Please login to use AI features');
//           navigate('/login');
//         } else if (error.response.status === 403) {
//           setAiError('Premium subscription required for AI features');
//         } else {
//           setAiError(error.response.data?.message || 'Failed to generate description');
//         }
//       } else {
//         setAiError('Network error. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAITags = async () => {
//     if (!isSubscribed) {
//       setAiError('Premium subscription required for AI features');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       if (!formData.title.trim()) {
//         setAiError('Please enter a title first');
//         return;
//       }

//       setTagLoading(true);
//       setAiError(null);

//       const res = await axios.post(
//         'http://localhost:3000/api/ai/tags',
//         { title: formData.title },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setFormData((prev) => ({
//         ...prev,
//         tags: res.data.tags || '',
//       }));
//     } catch (error) {
//       console.error('AI tag suggestion error:', error);
//       if (error.response) {
//         if (error.response.status === 401) {
//           setAiError('Please login to use AI features');
//           navigate('/login');
//         } else if (error.response.status === 403) {
//           setAiError('Premium subscription required for AI features');
//         } else {
//           setAiError(error.response.data?.message || 'Failed to generate tags');
//         }
//       } else {
//         setAiError('Network error. Please try again.');
//       }
//     } finally {
//       setTagLoading(false);
//     }
//   };


//   return (
//     <div className="create-post-page">
//       <div className="post-card">
//         <h2 className="card-title">Create a New Post</h2>

//         <form onSubmit={handleSubmit} className="post-form">
//           <div className="form-group">
//             <label htmlFor="title">Title</label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               placeholder="A catchy title for your post"
//               value={formData.title}
//               onChange={handleChange}
//               required
//               className="form-input"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="description">Description</label>
//             <textarea
//               id="description"
//               name="description"
//               placeholder="Tell us more about your post..."
//               value={formData.description}
//               onChange={handleChange}
//               rows="6"
//               required
//               className={`form-textarea ${loading ? 'typing-effect' : ''}`}
//             />
//           </div>

//           <button
//             type="button"
//             onClick={handleAISuggest}
//             disabled={loading || !formData.title.trim() || !isSubscribed}
//             className={`ai-btn ${!isSubscribed ? 'disabled' : ''}`}
//           >
//             {!isSubscribed ? 'Subscribe for AI Features' : 
//              loading ? 'Generating...' : 'Generate Description'}
//           </button>

//           <div className="form-group">
//             <label htmlFor="tags">Tags</label>
//             <input
//               type="text"
//               id="tags"
//               name="tags"
//               placeholder="e.g., #nature, #travel, #photography (comma separated)"
//               value={formData.tags}
//               onChange={handleChange}
//               className="form-input"
//             />
//           </div>

//           <button
//             type="button"
//             onClick={handleAITags}
//             disabled={tagLoading || !formData.title.trim() || !isSubscribed}
//             className={`ai-btn ${!isSubscribed ? 'disabled' : ''}`}
//           >
//             {!isSubscribed ? 'Subscribe for AI Features' : 
//              tagLoading ? 'Generating Tags...' : 'Suggest Tags'}
//           </button>

//           {aiError && (
//             <div className={`ai-error-message ${aiError.includes('Premium') ? 'premium-error' : ''}`}>
//               {aiError}
//               {aiError.includes('Premium') && (
//                 <button
//                   className="upgrade-btn"
//                   onClick={() => navigate('/subscription')}
//                 >
//                   Upgrade Now
//                 </button>
//               )}
//             </div>
//           )}

//           <div className="form-group file-upload-group">
//             <label htmlFor="image-upload" className="file-upload-label">
//               <FaImage className="upload-icon" /> Choose Image
//               {formData.image && <span className="file-name">{formData.image.name}</span>}
//             </label>
//             <input
//               type="file"
//               id="image-upload"
//               name="image"
//               accept="image/*"
//               onChange={handleChange}
//               required
//               className="file-input"
//             />
//             {imagePreview && (
//               <div className="image-preview-container">
//                 <img src={imagePreview} alt="Preview" className="image-preview" />
//                 <button type="button" className="clear-image-btn" onClick={clearImage}>
//                   <FaTimes />
//                 </button>
//               </div>
//             )}
//           </div>

//           <button type="submit" className="submit-btn" disabled={loading}>
//             <FaPaperPlane /> {loading ? 'Uploading...' : 'Upload Post'}
//           </button>

//           {message && (
//             <p className={`form-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
//               {message}
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreatePost;