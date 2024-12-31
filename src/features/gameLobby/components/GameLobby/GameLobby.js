import React, { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import GameCard from '../GameCard/GameCard';
import { analyzeChallenges } from '../../../../utils/challengeAnalysis';
import { getUserUnitPreference, authFetch, API_URL } from '../../../../utils/utils';
import './GameLobby.scss';

const GameLobby = () => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        location: '',
        radius: '10',
        difficulty: [],
        duration: 'any',
        sortBy: 'rating'
    });

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await authFetch(`${API_URL}/server/api/games/games.php?action=public_games`);
                if (!response.ok) {
                    throw new Error('Failed to fetch games');
                }
                const { status, data, message } = await response.json();
                if (status === 'success') {
                    console.warn("Fetched games:", data);
                    setGames(data);
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

        fetchGames();
    }, []);

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
        const analysis = analyzeChallenges(challenges, isMetric);

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
            ),

            // Distance if available
            analysis.maxDistance && `${analysis.maxDistance} ${analysis.unit} total`
        ].filter(Boolean);

        return {
            id: game.id,
            title: game.title || 'Untitled Adventure',
            difficulty: firstChallenge.difficulty || 'medium',
            distance: analysis.maxDistance ? parseFloat(analysis.maxDistance) : 2.5,
            rating: 4.5,
            ratingCount: Math.floor(Math.random() * 50) + 10,
            duration: totalDuration,
            description: cleanDescription || 'No description available',
            tags: tags,
            imageUrl: firstChallenge.imageUrl,
            totalChallenges: analysis.totalChallenges,
            creator: game.creator_name
        };
    });

    const handleSearch = (query) => {
        console.log('Search query:', query);
        setSearchQuery(query);
    };

    const handleFilterChange = (newFilters) => {
        console.log('Filter change:', newFilters);
        setFilters({ ...filters, ...newFilters });
    };

    return (
        <div className="game-lobby">
            <div className="search-header">
                <SearchBar
                    onSearch={handleSearch}
                    onFilterToggle={setIsFilterVisible}
                    isFilterVisible={isFilterVisible}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>
            {loading ? (
                <div className="loading">Loading games...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : transformedGames.length === 0 ? (
                <div className="no-games">No games available</div>
            ) : (
                <div className="games-grid">
                    {transformedGames.map(game => (
                        <GameCard key={game.id} {...game} />
                    ))}
                </div>
            )}
            {!loading && !error && transformedGames.length > 0 && (
                <div className="pagination">
                    <button className="load-more-button">Load More Games</button>
                </div>
            )}
        </div>
    );
};

export default GameLobby;
