import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
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

interface Game {
  gameId: string;
}

interface ChallengeMapProps {
  challenges: Challenge[];
  game: Game;
  defaultCenter?: google.maps.LatLngLiteral;
  defaultZoom?: number;
  isLoading?: boolean;
}

// Extend window interface
declare global {
  interface Window {
    handleChallengeEdit?: (challengeId: string, gameId: string) => void;
  }
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
  game,
  defaultCenter = { lat: 40.7128, lng: -74.0060 },
  defaultZoom = 12,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
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

  // Get initial center from first challenge or default to NYC
  const getInitialCenter = (): google.maps.LatLngLiteral => {
    if (challenges.length > 0) {
      return challenges[0].location;
    }
    return defaultCenter;
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    if (challenges.length > 0) {
      // If we have multiple challenges, fit bounds
      if (challenges.length > 1) {
        fitBoundsWithPadding();
      } else {
        // For single challenge, center and zoom
        map.setCenter(challenges[0].location);
        map.setZoom(15); // Closer zoom for single location
      }
    }
  };

  const handleMarkerClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleEditClick = (challengeId: string) => {
    if (!game?.gameId) return;
    navigate(`/create/challenge/${game.gameId}/${challengeId}`);
  };

  // Create info window instance
  useEffect(() => {
    infoWindowRef.current = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -30)
    });

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  // Update info window content when selected challenge changes
  useEffect(() => {
    if (selectedChallenge && infoWindowRef.current && mapRef.current && game?.gameId) {
      const content = `
        <div class="challenge-map__info-window">
          <h3 class="challenge-map__info-window-title">
            ${selectedChallenge.title}
          </h3>
          <button
            class="challenge-map__info-window-edit"
            onclick="window.handleChallengeEdit && window.handleChallengeEdit('${selectedChallenge.id}', '${game.gameId}')"
          >
            Edit Challenge
          </button>
        </div>
      `;

      infoWindowRef.current.setContent(content);
      infoWindowRef.current.setPosition(selectedChallenge.location);
      infoWindowRef.current.open(mapRef.current);
    } else if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [selectedChallenge, game?.gameId]);

  // Add global handler for edit button click
  useEffect(() => {
    if (!game?.gameId) return;

    window.handleChallengeEdit = (challengeId: string, gameId: string) => {
      handleEditClick(challengeId);
    };

    return () => {
      window.handleChallengeEdit = undefined;
    };
  }, [handleEditClick, game?.gameId]);

  // Custom marker icon configuration
  const getMarkerOptions = (index: number) => ({
    animation: google.maps.Animation.DROP,
    label: {
      text: (index + 1).toString(),
      className: 'challenge-map__marker',
      color: '#FFFFFF',
      fontSize: '14px',
      fontFamily: 'var(--font-family)'
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 14,
      fillColor: '#4A90E2',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF'
    }
  });

  if (error) {
    return (
      <div className="challenge-map challenge-map--error">
        <p>Error loading map: {error}</p>
      </div>
    );
  }

  if (isLoading || !game?.gameId) {
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
        center={getInitialCenter()}
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
          <MarkerF
            key={challenge.id}
            position={challenge.location}
            {...getMarkerOptions(index)}
            onClick={() => handleMarkerClick(challenge)}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default ChallengeMap;
