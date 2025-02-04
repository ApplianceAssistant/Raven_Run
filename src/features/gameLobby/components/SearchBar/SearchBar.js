import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.scss';

const SearchBar = ({ onSearch, onFilterToggle, isFilterVisible, filters, onFilterChange }) => {
    const [query, setQuery] = useState('');
    const searchPanelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
                onFilterToggle(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onFilterToggle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleFilterChange = (field, value) => {
        onFilterChange({ [field]: value });
    };

    const difficultyOptions = ['easy', 'medium', 'hard'];
    const radiusOptions = ['5', '10', '25', '50'];
    const durationOptions = [
        { value: 'any', label: 'Any Duration' },
        { value: '30', label: '< 30 mins' },
        { value: '60', label: '30-60 mins' },
        { value: '120', label: '1-2 hours' },
        { value: '121', label: '2+ hours' }
    ];
    const sortOptions = [
        { value: 'rating', label: 'Rating' },
        { value: 'distance', label: 'Distance' },
        { value: 'duration', label: 'Duration' },
        { value: 'recent', label: 'Recently Added' }
    ];

    return (
        <div 
            className={`search-panel ${isFilterVisible ? 'expanded' : ''}`} 
            ref={searchPanelRef}
        >
            <div className="search-content">
                <form onSubmit={handleSubmit}>
                    <div className="search-input-group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search games..."
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>

                    <div className="filter-content">
                        <div className="filter-group">
                            <div className="location-filter">
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                />
                                <select
                                    value={filters.radius}
                                    onChange={(e) => handleFilterChange('radius', e.target.value)}
                                >
                                    {radiusOptions.map(radius => (
                                        <option key={radius} value={radius}>{radius} km</option>
                                    ))}
                                </select>
                            </div>

                            <div className="difficulty-filter">
                                <label>Difficulty:</label>
                                <div className="toggle-group">
                                    {difficultyOptions.map(diff => (
                                        <button
                                            key={diff}
                                            type="button"
                                            className={filters.difficulty.includes(diff) ? 'active' : ''}
                                            onClick={() => {
                                                const newDifficulties = filters.difficulty.includes(diff)
                                                    ? filters.difficulty.filter(d => d !== diff)
                                                    : [...filters.difficulty, diff];
                                                handleFilterChange('difficulty', newDifficulties);
                                            }}
                                        >
                                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="time-filter">
                                <label>Duration:</label>
                                <select
                                    value={filters.duration}
                                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                                >
                                    {durationOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sort-options">
                                <label>Sort by:</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <div 
                className="panel-tab"
                onClick={() => onFilterToggle(!isFilterVisible)}
            >
                <i className="fas fa-search"></i>
                <i className="fas fa-bars"></i>
                <span className="tab-text">Search Tools</span>
            </div>
        </div>
    );
};

export default SearchBar;