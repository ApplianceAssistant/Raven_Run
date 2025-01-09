import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import GameCard from '../GameCard/GameCard';
import Modal from '../../../../components/Modal';
import ScrollableContent from '../../../../components/ScrollableContent';
import { getUserUnitPreference, authFetch, API_URL } from '../../../../utils/utils';
import { getHuntProgress, clearHuntProgress } from '../../../../utils/huntProgressUtils';
import { downloadGame } from '../../../gameplay/services/gameplayService';
import './GameLobby.scss';

const GameLobby = () => {
    const navigate = useNavigate();
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [filters, setFilters] = useState({
        location: '',
        radius: '10',
        difficulty: [],
        duration: 'any',
        sortBy: 'rating'
    });

    const loadGames = async (pageNum = 1) => {
        try {
            setLoading(true);
            
            const response = await authFetch(`${API_URL}/server/api/games/games.php?action=public_games&page=${pageNum}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }

            // Get the raw text first
            const rawText = await response.text();
            
            // Try to parse it as JSON
            let jsonData;
            try {
                jsonData = JSON.parse(rawText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Failed to parse text:', rawText);
                throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
            }

            const { status, data, message } = jsonData;
            
            if (status === 'success') {
                if (pageNum === 1) {
                    setGames(data);
                } else {
                    setGames(prev => [...prev, ...data]);
                }
                setHasMore(data.length > 0);
                setError(null);
            } else {
                throw new Error(message || 'Failed to fetch games');
            }
        } catch (err) {
            setError('Failed to load games');
            console.error('Error fetching games:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGames();
    }, []);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadGames(nextPage);
        }
    };

    const handleScroll = (isAtBottom) => {
        if (isAtBottom && !loading && hasMore) {
            handleLoadMore();
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPage(1);
        loadGames(1);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1);
        loadGames(1);
    };

    const handleGameSelect = (gameId) => {
        const progress = getHuntProgress();
        if (progress) {
            setSelectedGameId(gameId);
            setIsModalOpen(true);
        } else {
            navigate(`/gamedescription/${gameId}`);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedGameId(null);
    };

    const continueGame = () => {
        const progress = getHuntProgress();
        if (progress) {
            navigate(`/game/${progress.gameId}/challenge/${progress.challengeIndex}`);
        }
        setIsModalOpen(false);
    };

    const startNewGame = async () => {
        if (selectedGameId) {
            try {
                // Get the hunt progress to check timestamp
                const progress = getHuntProgress();
                if (progress && progress.gameId === selectedGameId) {
                    // Check if we have a server connection and if the game needs updating
                    const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get&gameId=${selectedGameId}`);
                    if (response.ok) {
                        const rawText = await response.text();
                        const serverGame = JSON.parse(rawText);
                        
                        // Compare timestamps to see if game needs updating
                        if (serverGame.updated_at && progress.timestamp && 
                            new Date(serverGame.updated_at) > new Date(progress.timestamp)) {
                            // Game has been updated since last play, download fresh version
                            await downloadGame(selectedGameId);
                            console.log('Game updated to latest version');
                        }
                    }
                }
            } catch (error) {
                // If there's any error (offline, parse error, etc.), just continue with local version
                console.warn('Could not check for game updates:', error);
            }
            
            // Clear hunt progress and navigate to game description
            clearHuntProgress();
            navigate(`/gamedescription/${selectedGameId}`);
        }
        setIsModalOpen(false);
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
                    onSearch={handleSearch}
                    onFilterToggle={setIsFilterVisible}
                    isFilterVisible={isFilterVisible}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>
            
            <ScrollableContent maxHeight="80vh" onScrollEnd={handleScroll} className="games-container">
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
                {loading && <div className="loading">Loading...</div>}
                {error && <div className="error">{error}</div>}
            </ScrollableContent>

            <Modal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                title={getHuntProgress()?.gameId === selectedGameId ? "Continue Hunt?" : "Hunt in Progress"}
                content={getHuntProgress()?.gameId === selectedGameId ? 
                    "You have a hunt in progress. Would you like to continue where you left off?" :
                    "You have another hunt in progress. Would you like to abandon it and start a new one?"}
                buttons={getHuntProgress()?.gameId === selectedGameId ? [
                    { label: 'Continue', onClick: continueGame },
                    { label: 'Start Over', onClick: startNewGame },
                    { label: 'Cancel', onClick: handleModalClose }
                ] : [
                    { label: 'Start New', onClick: startNewGame },
                    { label: 'Cancel', onClick: handleModalClose }
                ]}
                showTextToSpeech={false}
            />
        </div>
    );
};

export default GameLobby;
