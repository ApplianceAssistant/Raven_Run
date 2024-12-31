import React, { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import GameCard from '../GameCard/GameCard';
import ScrollableContent from '../../../../components/ScrollableContent';
import { analyzeChallenges } from '../../../../utils/challengeAnalysis';
import { getUserUnitPreference, authFetch, API_URL } from '../../../../utils/utils';
import './GameLobby.scss';

const GameLobby = () => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
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
            const { status, data, message } = await response.json();
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
            )
        ].filter(Boolean);

        return {
            id: game.id,
            title: game.title || 'Untitled Adventure',
            description: cleanDescription || 'No description available',
            difficulty: game.difficulty || 'medium',
            distance: game.distance || 0,
            rating: game.avg_rating || 0,
            ratingCount: game.rating_count || 0,
            duration: totalDuration,
            challenges: challenges,
            challengeCount: Array.isArray(challenges) ? challenges.length : 0,
            tags: tags,
            dayOnly: game.dayOnly || false,
            createdAt: game.createdAt,
            updatedAt: game.updatedAt,
            userId: game.userId,
            estimatedTime: game.estimatedTime,
            startLocation: game.startLocation,
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
                        <GameCard key={game.id} {...game} />
                    ))}
                </div>
                {loading && <div className="loading">Loading...</div>}
                {error && <div className="error">{error}</div>}
            </ScrollableContent>
        </div>
    );
};

export default GameLobby;
