import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import './ChallengeMap.scss';

interface Challenge {
  id: string;
  title: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface ChallengeMapProps {
  challenges: Challenge[];
  defaultCenter?: google.maps.LatLngLiteral;
  defaultZoom?: number;
  isLoading?: boolean;
}

// Custom map styling to match app theme
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [{ saturation: -30 }]
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
];

const ChallengeMap: React.FC<ChallengeMapProps> = ({
  challenges,
  defaultCenter = { lat: 40.7128, lng: -74.0060 },
  defaultZoom = 12,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: '100%', height: '400px' });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const updateMapSize = () => {
      if (containerRef.current?.parentElement) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        const contentVh = parseFloat(getComputedStyle(document.documentElement)
          .getPropertyValue('--content-vh'));
        
        const availableHeight = (contentVh * 100) - 80;
        
        setMapDimensions({
          width: `${parentWidth}px`,
          height: `${availableHeight}px`
        });

        if (mapRef.current) {
          google.maps.event.trigger(mapRef.current, 'resize');
          if (challenges.length > 0) {
            fitBoundsWithPadding();
          }
        }
      }
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      requestAnimationFrame(updateMapSize);
    });

    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current);
      if (containerRef.current.parentElement) {
        resizeObserverRef.current.observe(containerRef.current.parentElement);
      }
    }

    updateMapSize();

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [challenges]);

  const fitBoundsWithPadding = () => {
    if (!mapRef.current || challenges.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    challenges.forEach(challenge => bounds.extend(challenge.location));

    // Add padding to bounds using number value
    mapRef.current.fitBounds(bounds, 50);
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (challenges.length > 0) {
      fitBoundsWithPadding();
    }
  };

  const handleMarkerClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleEditClick = (challengeId: string) => {
    navigate(`/challenges/${challengeId}/edit`);
  };

  if (error) {
    return (
      <div className="challenge-map challenge-map--error">
        <p>Error loading map: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="challenge-map challenge-map--loading">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="challenge-map" ref={containerRef}>
      <GoogleMap
        mapContainerStyle={mapDimensions}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={onMapLoad}
        options={{
          styles: mapStyles,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          }
        }}
      >
        {challenges.map((challenge, index) => (
          <Marker
            key={challenge.id}
            position={challenge.location}
            onClick={() => handleMarkerClick(challenge)}
            animation={google.maps.Animation.DROP}
            label={{
              text: (index + 1).toString(),
              className: 'challenge-map__marker'
            }}
          />
        ))}

        {selectedChallenge && (
          <InfoWindow
            position={selectedChallenge.location}
            onCloseClick={() => setSelectedChallenge(null)}
          >
            <div className="challenge-map__info-window">
              <h3 className="challenge-map__info-window-title">
                {selectedChallenge.title}
              </h3>
              <button
                className="challenge-map__info-window-edit"
                onClick={() => handleEditClick(selectedChallenge.id)}
              >
                Edit Challenge
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default ChallengeMap;
