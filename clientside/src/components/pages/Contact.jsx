import React, { useState } from 'react';
import '../css/contact.css'; // Link to its dedicated CSS file
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa'; // Icons for contact info and submit

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submissionMessage, setSubmissionMessage] = useState('');

  // No backend logic here, just console logging for demonstration as per request.
  // In a real app, you'd send this data to an API endpoint.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmissionMessage('✅ Your message has been sent successfully! We will get back to you soon.');
    // Reset form after 'submission'
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        <h2 className="card-title">Contact Us</h2>
        <p className="card-description">
          Have questions, feedback, or just want to say hello? Reach out to us through the form below or using our contact details.
        </p>

        {/* Contact Details Section */}
        <div className="contact-details-section">
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <span>Email: <a href="mailto:support@insightflow.com">support@insightflow.com</a></span>
          </div>
          <div className="contact-item">
            <FaPhone className="contact-icon" />
            <span>Phone: +1 (123) 456-7890</span>
          </div>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <span>Address: 123 Insight Rd, Flow City, IC 54321</span>
          </div>
        </div>

        <hr className="divider" />

        {/* Contact Form Section */}
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="Type your message here..."
              value={formData.message}
              onChange={handleChange}
              rows="6"
              required
              className="form-textarea"
            />
          </div>

          <button type="submit" className="submit-btn">
            <FaPaperPlane /> Send Message
          </button>

          {submissionMessage && (
            <p className={`form-message ${submissionMessage.startsWith('✅') ? 'success' : 'error'}`}>
              {submissionMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}