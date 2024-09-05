import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkServerConnectivity, API_URL } from '../utils/utils.js';

function CreateAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverStatus, setServerStatus] = useState({
    isConnected: false,
    isDatabaseConnected: false,
    message: ''
  });
  
  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkServerConnectivity();
      console.log("status: ", status);
      setServerStatus(status);
    };

    checkConnection();
  }, []);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serverStatus.isConnected || !serverStatus.isDatabaseConnected) {
      alert('Cannot create account: Server or database is not connected');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email, // Assuming you have an email field in your form
          password,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create account');
      }
  
      const data = await response.json();
      console.log('Account created:', data);
  
      // Optionally, you can store the user data in your app's state or local storage here
  
      // Redirect to lobby
      navigate('/lobby');
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="content-wrapper">
      <div className="spirit-guide-large">
        <div className="bodyContent center">
          <h1>Gather Your Courage</h1>
          {!serverStatus.isConnected && (
            <p className="error">Server is not connected. Please try again later.</p>
          )}
          {serverStatus.isConnected && !serverStatus.isDatabaseConnected && (
            <p className="error">Database is not connected. Please try again later.</p>
          )}
          {serverStatus.isConnected && serverStatus.isDatabaseConnected && (
            <p className="success">Server and database connection established.</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="account-field">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="account-field">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;