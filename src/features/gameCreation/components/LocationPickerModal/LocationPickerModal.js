import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import './LocationPickerModal.scss';

const libraries = ['places'];
const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC fallback
const defaultLocation = defaultCenter;

const LocationPickerModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialLocation,
  className = '' 
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (isOpen && map) {
      // Clear existing marker
      if (marker) {
        marker.setMap(null);
        setMarker(null);
      }

      // If we have initial coordinates, use them
      if (initialLocation?.lat && initialLocation?.lng) {
        const position = {
          lat: parseFloat(initialLocation.lat),
          lng: parseFloat(initialLocation.lng)
        };
        createMarker(position);
        map.setCenter(position);
      } else {
        // Try to get user's location
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              createMarker(pos);
              map.setCenter(pos);
            },
            () => {
              // On error, use NYC as fallback
              createMarker(defaultCenter);
              map.setCenter(defaultCenter);
            }
          );
        } else {
          // Fallback to NYC if geolocation not available
          createMarker(defaultCenter);
          map.setCenter(defaultCenter);
        }
      }
    }
  }, [isOpen, map, initialLocation]);

  const createMarker = (position) => {
    if (marker) {
      marker.setMap(null);
    }
    
    const newMarker = new window.google.maps.Marker({
      position,
      map,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });

    newMarker.addListener('dragend', onMarkerDragEnd);
    setMarker(newMarker);
    setSelectedLocation(position);
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const position = { lat, lng };
    setSelectedLocation(position);
    createMarker(position);
  };

  const handleSave = () => {
    if (selectedLocation) {
      onSave({
        latitude: selectedLocation.lat.toString(),
        longitude: selectedLocation.lng.toString()
      });
      onClose();
    }
  };

  const handleClose = () => {
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }
    onClose();
  };

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
  };

  if (!isOpen) return null;

  if (loadError) {
    return <div className="location-picker-modal">Failed to load Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className="location-picker-modal">Loading...</div>;
  }

  return (
    <div className={`location-picker-modal ${className}`}>
      <div className="location-picker-modal__content">
        <div className="location-picker-modal__header">
          <div className="location-picker-modal__buttons">
            <button 
              className="location-picker-modal__save"
              onClick={handleSave}
            >
              <FontAwesomeIcon icon={faSave} /> Save
            </button>
            <button 
              className="location-picker-modal__close"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
        </div>
        <div className="location-picker-modal__map-container">
          <GoogleMap
            mapContainerClassName="location-picker-modal__map"
            center={defaultCenter}
            zoom={12}
            options={{
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true
            }}
            onClick={handleMapClick}
            onLoad={setMap}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
