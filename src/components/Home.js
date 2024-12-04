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
    navigate('/lobby');
  };

  if (!isAuthenticated) {
    return <Welcome />;
  }

  return (
      <>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="button-container">
            <button onClick={handleCreateIndex} className="join-button">Create</button>
            <button onClick={handlePlayIndex} className="enter-button">Play</button>
          </div>
        </div>
    </>
  );
}

export default Home;