import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Protect = ({ children }) => {
  const [allowed, setAllowed] = useState(null); // null = loading, true/false = result

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAllowed(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:3000/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.isBanned) {
          alert('Your account has been banned. Access denied.');
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (err) {
        setAllowed(false);
      }
    };

    checkUser();
  }, []);

  if (allowed === null) return <p>Checking permission...</p>;
  if (!allowed) return <Navigate to="/" />;

  return children;
};

export default Protect;
