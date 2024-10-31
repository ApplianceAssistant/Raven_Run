import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';


function Home() {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCreateIndex = () => {
    //route user to non logged in create hunt details page
    navigate('/create');
  }
  const handleCreate = () => {
    //route user to non logged in create hunt details page
    navigate('/create');
  }

  const handlePlayIndex = () => {
    //route user to non logged in play details page
    navigate('/lobby');
  }

  const handlePlay = () => {
    //route user to the play lobby
    navigate('/lobby');
  };

  return (
    <>
      <div className="background"></div>
      <div className="content-wrapper">
          <div className="content">
            <div className="bodyContent">
              <div className="button-container home">
                {isLoggedIn ? (
                  <>
                  <button onClick={handleCreate} className="join-button">Create</button>
                  <button onClick={handlePlay}className="enter-button">Play</button>
                </>
                ) : (
                  <>
                    <button onClick={handleCreateIndex} className="join-button">Create</button>
                    <button onClick={handlePlayIndex}className="enter-button">Play</button>
                  </>
                )}
              </div>
            </div>
          </div>
      </div>
    </>
  );
}

export default Home;