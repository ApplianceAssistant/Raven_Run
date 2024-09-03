import React, { useState } from 'react';

const DevLocationSetter = ({ onLocationSet }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationSet({ latitude: lat, longitude: lng });
    } else {
      alert('Please enter valid numbers for latitude and longitude.');
    }
  };

  return (
    <div className="dev-location-setter">
      <h3>Set Dev Location</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Latitude"
        />
        <input
          type="text"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Longitude"
        />
        <button type="submit">Set Location</button>
      </form>
    </div>
  );
};

export default DevLocationSetter;