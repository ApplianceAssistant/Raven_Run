import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import Welcome from './Welcome';
import NavigationOptions from './NavigationOptions';

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
    <NavigationOptions 
      title="Crow Tours"
      subtitle="Create Your Next Adventure"
    />
  );
}

export default Home;