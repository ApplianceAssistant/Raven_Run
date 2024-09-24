import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';


function Home() {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate('/create-profile');
  };

  const handleLogIn = () => {
    navigate('/log-in');
  }

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
                  <>
                    <button onClick={handleJoin} className="join-button">Join</button>
                    <button onClick={handleLogIn}className="enter-button">Log In</button>
                  </>
                )}
              </div>
              <h1>Site Is In Development</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;