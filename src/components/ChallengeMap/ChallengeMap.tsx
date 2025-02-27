import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { GoogleMap, useLoadScript, Libraries } from '@react-google-maps/api';
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

// Libraries we need to load
const libraries: Libraries = ['marker'];

// Extend window interface
declare global {
  interface Window {
    handleChallengeEdit?: (challengeId: string, gameId: string) => void;
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<any>;
        MarkerLibrary?: any;
      };
    };
  }
}

// Singleton to track script loading
let isScriptFullyLoaded = false;

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
  const markersRef = useRef<Map<string, any>>(new Map());
  const [mapDimensions, setMapDimensions] = useState({ width: '100%', height: '100%' });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Load the required libraries
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
    mapIds: ['raven_run_map'],
    preventGoogleFontsLoading: true
  });

  // Check if script is fully loaded
  useEffect(() => {
    if (isLoaded && !isScriptFullyLoaded) {
      const checkScriptLoaded = () => {
        if (window.google?.maps?.importLibrary != null) {
          isScriptFullyLoaded = true;
          setMapsLoaded(true);
        } else {
          setTimeout(checkScriptLoaded, 100);
        }
      };
      checkScriptLoaded();
    }
  }, [isLoaded]);

  // Cleanup function to reset script loading state
  useEffect(() => {
    return () => {
      isScriptFullyLoaded = false;
    };
  }, []);

  // Map options that stay constant
  const mapOptions = {
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    zoomControlOptions: {
      position: 8 // google.maps.ControlPosition.RIGHT_TOP
    },
    // Required for Advanced Markers
    mapId: 'raven_run_map',
    // Disable default UI for custom styling
    disableDefaultUI: true,
    backgroundColor: '#f5f5f5',
    clickableIcons: false
  };

  // Track resize of container and update map dimensions
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

  const onMapLoad = async (map: google.maps.Map) => {
    
    if (!isScriptFullyLoaded) {
      // Wait for script to be fully loaded
      await new Promise<void>((resolve) => {
        const checkLoaded = () => {
          if (isScriptFullyLoaded) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }
    
    mapRef.current = map;
    
    if (challenges.length > 0) {
      
      if (challenges.length > 1) {
        fitBoundsWithPadding();
      } else {
        map.setCenter(challenges[0].location);
        map.setZoom(15);
      }
    }

    try {
      const { AdvancedMarkerElement } = await window.google?.maps?.importLibrary("marker") as google.maps.MarkerLibrary;
      
      for (let i = 0; i < challenges.length; i++) {
        await createAdvancedMarker(challenges[i], i, AdvancedMarkerElement);
        
        // After each marker is created, log the total number of visible markers
        const visibleMarkers = Array.from(document.getElementsByClassName('challenge-map__marker'))
          .filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          });
      }
    } catch (error) {
      console.error('Error importing marker library:', error);
      setError('Failed to initialize map markers');
    }
  };

  const createAdvancedMarker = async (
    challenge: Challenge, 
    index: number,
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement
  ) => {
    if (!mapRef.current) {
      console.error('Map reference missing when creating marker', index);
      return;
    }

    try {
      // Create marker content
      const markerContent = document.createElement('div');
      markerContent.className = 'challenge-map__marker';
      markerContent.style.zIndex = '1000'; // Ensure marker is above other elements
      markerContent.style.position = 'relative'; // Explicit positioning
      markerContent.innerHTML = `
        <div class="challenge-map__marker-inner" style="
          background-color: #4A90E2;
          color: #FFFFFF;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
          font-family: var(--font-family);
          font-size: 14px;
          cursor: pointer;
          position: relative;
          z-index: 1000;
        ">
          ${index + 1}
        </div>
      `;

      // Create advanced marker with explicit options
      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: challenge.location,
        content: markerContent,
        title: challenge.title,
        collisionBehavior: google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL,
        zIndex: index === 0 ? 1000 : 100 // Give first marker higher z-index
      });

      // Force marker to be visible
      const markerElement = marker.element;
      if (markerElement) {
        markerElement.style.visibility = 'visible';
        markerElement.style.display = 'block';
        markerElement.style.opacity = '1';
      }

      // Create info window for this marker
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 16px;">
            <h3>${challenge.title}</h3>
            <button onclick="window.handleChallengeEdit('${challenge.id}', '${game?.gameId}')">
              Edit Challenge
            </button>
          </div>
        `,
        pixelOffset: new google.maps.Size(0, -30),
        disableAutoPan: false
      });

      // Add click listener
      marker.addEventListener('click', () => {
        // Close any open info windows
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        // Open this marker's info window
        infoWindow.open({
          map: mapRef.current,
          anchor: marker,
          shouldFocus: false
        });
        
        // Store reference to current info window
        infoWindowRef.current = infoWindow;
      });

      // Store marker reference
      markersRef.current.set(challenge.id, marker);     
    } catch (error) {
      console.error(`Error creating advanced marker ${index + 1}:`, error);
      setError('Failed to create map markers');
    }
  };

  const handleEditClick = (challengeId: string) => {
    if (!game?.gameId) return;
    navigate(`/create/challenge/${game.gameId}/${challengeId}`);
  };

  // Add global handler for edit button click
  useEffect(() => {
    if (!game?.gameId) return;

    const handleEdit = (challengeId: string, gameId: string) => {
      handleEditClick(challengeId);
    };

    window.handleChallengeEdit = handleEdit;

    return () => {
      if ('handleChallengeEdit' in window) {
        window.handleChallengeEdit = undefined;
      }
    };
  }, [game?.gameId, handleEditClick]);

  // Cleanup markers and map references on unmount
  useEffect(() => {
    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => {
        if (marker) {
          marker.map = null;
        }
      });
      markersRef.current.clear();

      // Clean up map reference
      if (mapRef.current) {
        mapRef.current = null;
      }

      // Clean up info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className="challenge-map challenge-map--error">
        <p>Error loading Google Maps: {loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded || isLoading || !game?.gameId) {
    return (
      <div className="challenge-map challenge-map--loading">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="challenge-map" ref={containerRef}>
      {isLoaded && mapsLoaded && (
        <GoogleMap
          mapContainerStyle={mapDimensions}
          center={getInitialCenter()}
          zoom={defaultZoom}
          onLoad={onMapLoad}
          options={mapOptions}
        />
      )}
    </div>
  );
};

export default React.memo(ChallengeMap);
