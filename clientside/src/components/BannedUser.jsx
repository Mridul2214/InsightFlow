import React from 'react';
import './css/banneduser.css';

const BannedUser = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="banned-user-overlay">
      <div className="banned-user-modal">
        <div className="banned-icon">🚫</div>
        <h1>Account Banned</h1>
        <p>Your account has been banned by the administrator.</p>
        <p>You cannot access the site until your ban is lifted.</p>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default BannedUser;
