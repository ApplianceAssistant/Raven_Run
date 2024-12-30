import React, { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import GameCard from '../GameCard/GameCard';
import './GameLobby.scss';

const GameLobby = () => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        radius: '10',
        difficulty: [],
        duration: 'any',
        sortBy: 'rating'
    });

    // Placeholder data for testing
    const mockGames = [
        {
            id: 1,
            title: 'Downtown Adventure',
            difficulty: 'medium',
            distance: 2.5,
            rating: 4.5,
            ratingCount: 42,
            duration: 45,
            description: 'Explore the historic downtown area with this exciting adventure!',
            tags: ['Adventure', 'History']
        },
        {
            id: 2,
            title: 'Park Mystery',
            difficulty: 'easy',
            distance: 1.8,
            rating: 4.2,
            ratingCount: 28,
            duration: 30,
            description: 'A family-friendly mystery hunt through the city park.',
            tags: ['Family', 'Nature']
        }
    ];

    const handleSearch = (query) => {
        console.log('Search query:', query);
        setSearchQuery(query);
    };

    const handleFilterChange = (newFilters) => {
        console.log('Filter change:', newFilters);
        setFilters({ ...filters, ...newFilters });
    };

    const handlePlayGame = (gameId) => {
        console.log('Play game:', gameId);
    };

    const handleLoadMore = () => {
        console.log('Load more games');
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

            <div className="games-grid">
                {mockGames.map(game => (
                    <GameCard 
                        key={game.id}
                        game={game}
                        onPlay={() => handlePlayGame(game.id)}
                    />
                ))}
            </div>

            <div className="pagination">
                <button className="load-more-button" onClick={handleLoadMore}>
                    Load More
                </button>
            </div>
        </div>
    );
};

export default GameLobby;
