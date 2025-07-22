import React from 'react';
import '../css/about.css'; // Link to its dedicated CSS file
import { FaGlobe, FaLightbulb, FaRocket, FaHandshake ,FaLock } from 'react-icons/fa'; // Icons for features/mission
import { useNavigate } from 'react-router-dom';


export default function About() {


 const navigate = useNavigate();
  const handleAdminLoginClick = () => {
    navigate('/adminlogin');
  };

  return (
    <div className="about-page">
      <div className="about-card">
        <h2 className="card-title">About InsightFlow</h2>
        <button 
          onClick={handleAdminLoginClick}
          className="admin-login-btn"
        >
          <FaLock /> Admin Login
        </button>

        <p className="card-description">
          Welcome to InsightFlow, your dynamic platform for sharing and discovering engaging content across various formats. Whether it's thought-provoking articles, captivating videos, or insightful blog posts, InsightFlow is designed to connect creators and consumers in a seamless and intuitive environment.
        </p>

        <hr className="divider" />

        {/* Mission/Vision Section */}
        <div className="about-section">
          <FaLightbulb className="section-icon" />
          <h3>Our Mission</h3>
          <p>
            Our mission is to empower individuals to share their unique perspectives and knowledge with the world, fostering a community where ideas flow freely and insights are easily accessible. We believe in the power of diverse content to inspire, educate, and entertain.
          </p>
        </div>

        {/* What We Offer Section */}
        <div className="about-section">
          <FaRocket className="section-icon" />
          <h3>What We Offer</h3>
          <ul className="feature-list">
            <li><FaGlobe className="feature-icon" /> **Diverse Content:** Explore a wide range of posts, videos, and blogs from various creators.</li>
            <li><FaHandshake className="feature-icon" /> **Seamless Sharing:** Easily upload your own content and connect with your audience.</li>
            <li><i className="fas fa-magic feature-icon"></i> **AI-Powered Summaries:** Get quick insights into long content with our intelligent summarization tool.</li>
            <li><i className="fas fa-users feature-icon"></i> **Engaging Community:** Interact with creators and fellow users through comments and likes.</li>
          </ul>
          <p>
            InsightFlow is built to be a responsive and user-friendly experience, adapting to your device and preferences, including dark and light mode themes.
          </p>
        </div>

        <hr className="divider" />

        {/* Call to Action */}
        <div className="about-call-to-action">
          <h3>Join the Flow!</h3>
          <p>Ready to share your insights or discover something new? Join our growing community today!</p>
          {/* You might link to a registration page here */}
          <button className="join-now-btn">Start Exploring</button>
        </div>
      </div>
    </div>
  );
}