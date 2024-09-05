import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';


function Home() {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate('/create-account');
  };

  const handleEnter = () => {
    navigate('/lobby');
  };

  return (
    <>
      <div className="background"></div>
      <div className="content-wrapper">
        <div className="spirit-guide-large">
          <div className="content">
            <div className="bodyContent">
              <div className="button-container">
                <button onClick={handleJoin} className="join-button">Join</button>
                <button onClick={handleEnter} className="enter-button">Enter</button>
              </div>
              <h1>At Your Own Risk</h1>
            </div>
            <div className="scroll-indicator">
              <FontAwesomeIcon icon={faLongArrowUp} className="arrow up" />
              <FontAwesomeIcon icon={faArrowsV} className="arrow updown" />
              <FontAwesomeIcon icon={faLongArrowDown} className="arrow down" />
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default Home;