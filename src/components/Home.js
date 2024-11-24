import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import Welcome from './Welcome';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleCreateIndex = () => {
    navigate('/create');
  };

  const handlePlayIndex = () => {
    navigate('/play');
  };

  if (!isAuthenticated) {
    return <Welcome />;
  }

  return (
    <div className="home">
      <div className="content">
        <div className="button-container">
          <button onClick={handleCreateIndex} className="join-button">Create</button>
          <button onClick={handlePlayIndex} className="enter-button">Play</button>
        </div>
      </div>
    </div>
  );
}

export default Home;