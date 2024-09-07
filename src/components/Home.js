import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';


function Home() {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate('/create-account');
  };

  const handleEnter = () => {
    navigate('/lobby');
  };
  console.log("Home.js: isLoggedIn: ", isLoggedIn);
  return (
    <>
      <div className="background"></div>
      <div className="content-wrapper">
        <div className="spirit-guide large">
          <div className="content">
            <div className="bodyContent">
              <div className="button-container">
                {isLoggedIn ? (
                  <button onClick={handleEnter} className="enter-button">Lobby</button>
                ) : (
                  <button onClick={handleJoin} className="join-button">Join</button>
                )}
              </div>
              <h1>At Your Own Risk</h1>
              <p>Debug: isLoggedIn = {String(isLoggedIn)}</p>
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