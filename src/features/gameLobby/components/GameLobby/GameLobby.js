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
    const [isGameChangeModalOpen, setIsGameChangeModalOpen] = useState(false);
    const [isSameGameModalOpen, setIsSameGameModalOpen] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [filters, setFilters] = useState({
        locationFilter: 'any',
        radius: null,
        latitude: null,
        longitude: null,
        difficulty_level: null,
        duration: 'any',
        sort_by: 'rating',
        search: '',
        gameId: null
    });

    const handleFilterChange = (newFilters) => {
        
        setFilters(prev => {
            const updatedFilters = {
                ...prev,
                ...newFilters
            };
            return updatedFilters;
        });
        
        fetchGames(newFilters);
    };

    const handleSearch = (searchQuery, additionalFilters = {}) => {
        console.log('GameLobby handleSearch - searchQuery:', searchQuery, 'additionalFilters:', additionalFilters);
        const newFilters = {
            ...filters,
            search: searchQuery || '',  // Ensure search is an empty string if null
            ...additionalFilters
        };
        console.log('GameLobby setting new filters:', newFilters);
        setFilters(newFilters);
        fetchGames(newFilters);  // Immediately fetch with new filters
    };

    const fetchGames = async (searchFilters = filters) => {
        setIsLoading(true);
        console.log('GameLobby fetchGames - searchFilters:', searchFilters);
        try {
            const params = new URLSearchParams();
            
            // If gameId is provided, only search by gameId
            if (searchFilters.gameId) {
                console.log('GameLobby fetching by gameId:', searchFilters.gameId);
                params.append('gameId', searchFilters.gameId);
            } else {
                // Only add location params if we're using "mylocation" and have valid coordinates
                if (searchFilters.locationFilter === 'mylocation' && 
                    searchFilters.latitude != null && 
                    searchFilters.longitude != null) {
                    params.append('latitude', searchFilters.latitude);
                    params.append('longitude', searchFilters.longitude);
                    params.append('radius', searchFilters.radius || 0);
                }

                // Add other filters
                if (searchFilters.search) {
                    params.append('search', searchFilters.search);
                }
                if (searchFilters.difficulty_level) {
                    params.append('difficulty_level', searchFilters.difficulty_level);
                }
                if (searchFilters.duration && searchFilters.duration !== 'any') {
                    params.append('duration', searchFilters.duration);
                }
                if (searchFilters.sort_by) {
                    params.append('sort_by', searchFilters.sort_by);
                }
            }

            console.log('search games: ', params.toString());
            const requestUrl = `${API_URL}/server/api/games/searchGames.php?${params.toString()}`;
            
            const response = await authFetch(requestUrl);
            const rawText = await response.text();
            console.log('Raw response text:', rawText);
            const jsonData = JSON.parse(rawText);
            console.log('Parsed JSON data:', jsonData);
            
            if (jsonData.status === 'success') {
                console.log('Games from response:', jsonData.data.games);
                const processedGames = jsonData.data.games.map(game => ({
                    ...game,
                    distance: game.distance  // Pass the raw distance value without conversion
                }));
                console.log('Processed games:', processedGames);
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
            
            if (progress) {
                if (progress.gameId === gameId) {
                    // Show modal for continuing or restarting same game
                    setSelectedGameId(gameId);
                    setIsSameGameModalOpen(true);
                    return;
                } else {
                    // Show modal to confirm game change
                    setSelectedGameId(gameId);
                    setIsGameChangeModalOpen(true);
                    return;
                }
            }

            // No existing progress, start new game
            await startNewGame(gameId);
        } catch (error) {
            console.error('Error selecting game:', error);
            console.error('Failed to load game. Please try again.');
        }
    };

    const startNewGame = async (gameId) => {
        const game = await downloadGame(gameId);
        if (!game) {
            throw new Error('Failed to download game');
        }
        navigate(`/gamedescription/${gameId}`);
    };

    const handleContinueCurrentGame = () => {
        const progress = getHuntProgress();
        if (progress) {
            navigate(`/game/${progress.gameId}/challenge/${progress.challengeIndex}`);
        }
        setIsGameChangeModalOpen(false);
        setIsSameGameModalOpen(false);
    };

    const handleStartNewGame = async () => {
        if (selectedGameId) {
            clearHuntProgress();
            await startNewGame(selectedGameId);
        }
        setIsGameChangeModalOpen(false);
        setIsSameGameModalOpen(false);
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

        // Calculate challenge type distribution
        const challengeTypes = challenges.reduce((acc, challenge) => {
            acc[challenge.type] = (acc[challenge.type] || 0) + 1;
            return acc;
        }, {});

        // Create informative tags
        const tags = [
            // Game type tags
            game.dayOnly ? <i key="day" className="fas fa-sun" title="Day Only"/> : null,
            
            // Challenge composition
            ...Object.entries(challengeTypes).map(([type, count]) => 
                `${count} ${type}${count > 1 ? 's' : ''}`
            )
        ].filter(Boolean);

        return {
            id: game.id,
            title: game.title || 'Untitled Adventure',
            description: cleanDescription || 'No description available',
            difficulty: game.difficulty || 'normal',
            distance: game.distance || 0,
            avg_rating: parseFloat(game.avg_rating) || 0,
            ratingCount: parseInt(game.rating_count) || 0,
            duration: totalDuration,
            tags: tags,
            challenges: challenges,
            creator_name: game.creator_name || 'Anonymous',
            isDownloaded: false,
            image_url: game.image_url || null
        };
    });

    return (
        <div className="game-lobby">
            <div className="lobby-header">
                <SearchBar
                    onSearch={handleSearch}
                    onFilterToggle={setIsFilterVisible}
                    isFilterVisible={isFilterVisible}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    resultCount={games.length}
                />
            </div>
            
            <ScrollableContent dependencies={['game-lobby']} maxHeight="calc(var(--content-vh, 1vh) * 90)" className="games-container">
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

            <Modal
                isOpen={isGameChangeModalOpen}
                onClose={() => setIsGameChangeModalOpen(false)}
                title="Game in Progress"
                content={
                    <p>You have a game in progress. Would you like to continue or start a new game?</p>
                }
                buttons={[
                    {
                        label: 'Return to Current Game',
                        onClick: handleContinueCurrentGame,
                        className: 'btn-secondary'
                    },
                    {
                        label: 'Start New Game',
                        onClick: handleStartNewGame,
                        className: 'btn-primary'
                    }
                ]}
            />

            <Modal
                isOpen={isSameGameModalOpen}
                onClose={() => setIsSameGameModalOpen(false)}
                title="Continue Game"
                content={
                    <p>Would you like to pick up where you left off or start over?</p>
                }
                buttons={[
                    {
                        label: 'Continue Game',
                        onClick: handleContinueCurrentGame,
                        className: 'btn-secondary'
                    },
                    {
                        label: 'Start Over',
                        onClick: handleStartNewGame,
                        className: 'btn-primary'
                    }
                ]}
            />
        </div>
    );
};

export default GameLobby;
