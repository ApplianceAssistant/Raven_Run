import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import GameCard from '../GameCard/GameCard';
import Modal from '../../../../components/Modal';
import ScrollableContent from '../../../../components/ScrollableContent';
import { getUserUnitPreference, authFetch, API_URL } from '../../../../utils/utils';
import { getHuntProgress, clearHuntProgress } from '../../../../utils/huntProgressUtils';
import { downloadGame } from '../../../gameplay/services/gameplayService';
import { clearPlaytestState } from '../../../../utils/localStorageUtils';
import './GameLobby.scss';

const GameLobby = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        locationFilter: 'any',
        radius: null,
        latitude: null,
        longitude: null,
        difficulty: null,
        duration: 'any',
        sort_by: 'rating',
        search: ''
    });

    const handleFilterChange = (newFilters) => {
        console.log('GameLobby received filter change:', newFilters);
        console.log('Current filters before update:', filters);
        
        setFilters(prev => {
            const updatedFilters = {
                ...prev,
                ...newFilters
            };
            console.log('Updated filters:', updatedFilters);
            return updatedFilters;
        });
        
        fetchGames(newFilters);
    };

    const fetchGames = async (searchFilters = filters) => {
        console.log('Fetching games with filters:', searchFilters);
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            
            console.log('Building URL parameters...');
            console.log('Location filter state:', searchFilters.locationFilter);
            
            // Only add location params if we're using "mylocation" and have valid coordinates
            if (searchFilters.locationFilter === 'mylocation' && 
                searchFilters.latitude != null && 
                searchFilters.longitude != null) {
                params.append('latitude', searchFilters.latitude);
                params.append('longitude', searchFilters.longitude);
                params.append('radius', searchFilters.radius || 0);
                console.log('Added location parameters:', {
                    latitude: searchFilters.latitude,
                    longitude: searchFilters.longitude,
                    radius: searchFilters.radius
                });
            } else {
                console.log('Skipping location parameters - not using mylocation or coordinates missing');
            }

            // Add other filters
            if (searchFilters.search) {
                params.append('search', searchFilters.search);
                console.log('Added search parameter:', searchFilters.search);
            }
            if (searchFilters.difficulty) {
                params.append('difficulty', searchFilters.difficulty);
                console.log('Added difficulty parameter:', searchFilters.difficulty);
            }
            if (searchFilters.duration && searchFilters.duration !== 'any') {
                params.append('duration', searchFilters.duration);
                console.log('Added duration parameter:', searchFilters.duration);
            }
            if (searchFilters.sort_by) {
                params.append('sort_by', searchFilters.sort_by);
                console.log('Added sort parameter:', searchFilters.sort_by);
            }
            
            const requestUrl = `${API_URL}/server/api/games/searchGames.php?${params.toString()}`;
            console.log('Final request URL:', requestUrl);
            
            const response = await authFetch(requestUrl);
            const rawText = await response.text();
            const jsonData = JSON.parse(rawText);
            
            if (jsonData.status === 'success') {
                const processedGames = jsonData.data.games.map(game => ({
                    ...game,
                    distance: game.distance !== null ? 
                        (getUserUnitPreference() ? 
                            game.distance : 
                            game.distance * 0.621371) // km to miles
                        : null
                }));
                setGames(processedGames);
            } else {
                console.error('Error fetching games:', jsonData.message);
            }
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    // Store user's location without changing filter settings
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFilters(prev => {
                        // Only update location data if locationFilter is already 'mylocation'
                        if (prev.locationFilter === 'mylocation') {
                            return {
                                ...prev,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            };
                        }
                        return prev; // Don't change anything if locationFilter is 'any'
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }, []);

    const handleGameSelect = async (gameId) => {
        try {
            // Clear any existing playtest state
            clearPlaytestState();
            
            // Check if there's existing progress
            const progress = getHuntProgress();
            if (progress?.gameId === gameId) {
                const selectedGameId = gameId;
                const isModalOpen = true;
                return;
            }

            // Download and start new game
            const game = await downloadGame(gameId);
            if (!game) {
                throw new Error('Failed to download game');
            }

            navigate(`/gamedescription/${gameId}`);
        } catch (error) {
            console.error('Error selecting game:', error);
            console.error('Failed to load game. Please try again.');
        }
    };

    // Transform games data to match GameCard props
    const transformedGames = games.map(game => {
        const challenges = game.challenges || [];
        const firstChallenge = challenges[0] || {};
        const totalDuration = challenges.reduce((total, challenge) => {
            return total + (challenge.timeLimit || 0);
        }, 0) || 60;

        // Get a clean description by removing extra newlines and trimming
        const cleanDescription = game.description
            ?.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ')
            .slice(0, 150) + '...';

        // Get challenge analysis
        const isMetric = getUserUnitPreference();

        // Calculate challenge type distribution
        const challengeTypes = challenges.reduce((acc, challenge) => {
            acc[challenge.type] = (acc[challenge.type] || 0) + 1;
            return acc;
        }, {});

        // Create informative tags
        const tags = [
            // Game type tags
            'Adventure',
            game.dayOnly ? <i key="day" className="fas fa-sun" title="Day Only"/> : <i key="day-night" className="fas fa-moon" title="Day/Night"/>,
            
            // Challenge composition
            ...Object.entries(challengeTypes).map(([type, count]) => 
                `${count} ${type}${count > 1 ? 's' : ''}`
            )
        ].filter(Boolean);

        return {
            id: game.id,
            title: game.title || 'Untitled Adventure',
            description: cleanDescription || 'No description available',
            difficulty: game.difficulty || 'medium',
            distance: game.distance || 0,
            avg_rating: parseFloat(game.avg_rating) || 0,
            ratingCount: parseInt(game.rating_count) || 0,
            duration: totalDuration,
            tags: tags,
            challenges: challenges,
            creatorName: game.creator_name || 'Anonymous'
        };
    });

    return (
        <div className="game-lobby">
            <div className="lobby-header">
                <SearchBar
                    onSearch={(search) => handleFilterChange({ search })}
                    onFilterToggle={setIsFilterVisible}
                    isFilterVisible={isFilterVisible}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    resultCount={games.length}
                />
            </div>
            
            <ScrollableContent dependencies={['game-lobby']} maxHeight="calc(var(--content-vh, 1vh) * 80)" className="games-container">
                <div className="games-grid">
                    {transformedGames.map(game => (
                        <GameCard 
                            key={game.id} 
                            {...game}
                            inProgress={getHuntProgress()?.gameId === game.id}
                            onClick={(id) => handleGameSelect(id)}
                        />
                    ))}
                </div>
                {isLoading && <div className="loading">Loading...</div>}
            </ScrollableContent>
        </div>
    );
};

export default GameLobby;
