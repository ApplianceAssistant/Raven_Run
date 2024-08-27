import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CreateAccount.scss';

function CreateAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the data to your server
    // For now, we'll just simulate a successful account creation
    console.log('Account created:', { username, password });
    
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to lobby
    navigate('/lobby');
  };

  return (
    <div className="create-account content">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
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
  );
}

export default CreateAccount;