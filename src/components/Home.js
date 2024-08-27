import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.scss';

function Home() {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate('/create-account');
  };

  const handleEnter = () => {
    navigate('/lobby');
  };

  return (
    <div className="home content">
      
      <div className="button-container">
        <button onClick={handleJoin} className="join-button">Join</button>
        <button onClick={handleEnter} className="enter-button">Enter</button>
      </div>
      <h1>At Your Own Risk</h1>
    </div>
  );
}

export default Home;