import React, { useEffect } from 'react';
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

  useEffect(() => {
    const background = document.querySelector('.background');
    for (let i = 0; i < 100; i++) {
      const spot = document.createElement('div');
      spot.className = 'moving-spot';
      spot.style.left = `${Math.random() * 100}%`;
      spot.style.top = `${Math.random() * 100}%`;
      spot.style.animationDuration = `${10 + Math.random() * 20}s`;
      spot.style.animationDelay = `${Math.random() * 5}s`;
      background.appendChild(spot);
    }

    return () => {
      const spots = document.querySelectorAll('.moving-spot');
      spots.forEach(spot => spot.remove());
    };
  }, []);

  return (
    <>
      <div className="background"></div>
      <div className="content-wrapper">
        <div className="oval-content">
          <h1>At Your Own Risk</h1>
          <div className="button-container">
            <button onClick={handleJoin} className="join-button">Join</button>
            <button onClick={handleEnter} className="enter-button">Enter</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;