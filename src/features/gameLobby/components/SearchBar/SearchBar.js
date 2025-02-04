import React, { useState, useEffect, useRef } from 'react';
import { getUserUnitPreference } from '../../../../utils/utils';
import './SearchBar.scss';

const SearchBar = ({ onSearch, onFilterToggle, isFilterVisible, filters, onFilterChange, onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const searchPanelRef = useRef(null);
    const isMetric = getUserUnitPreference();

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

    const handleLocationChange = (value) => {
        onLocationSelect(value);
    };

    const difficultyOptions = ['easy', 'medium', 'hard'];
    const radiusOptions = isMetric ? 
        ['5', '10', '25', '50', '100'] :  // kilometers
        ['3', '5', '15', '30', '60'];     // miles
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
        <div className={`search-panel ${isFilterVisible ? 'expanded' : ''}`} ref={searchPanelRef}>
            <div className="search-content">
                <form onSubmit={handleSubmit}>
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit">Search</button>
                        <button 
                            type="button" 
                            className={`filter-toggle ${isFilterVisible ? 'active' : ''}`}
                            onClick={() => onFilterToggle(!isFilterVisible)}
                        >
                            Filters
                        </button>
                    </div>
                </form>

                {isFilterVisible && (
                    <div className="filter-panel">
                        <div className="filter-section">
                            <label>Location</label>
                            <div className="location-controls">
                                <button
                                    type="button"
                                    onClick={() => handleLocationChange('current')}
                                    className={filters.location === 'current' ? 'active' : ''}
                                >
                                    Use My Location
                                </button>
                            </div>
                        </div>

                        <div className="filter-section">
                            <label>Search Radius ({isMetric ? 'km' : 'mi'})</label>
                            <select 
                                value={filters.radius} 
                                onChange={(e) => handleFilterChange('radius', e.target.value)}
                            >
                                {radiusOptions.map(value => (
                                    <option key={value} value={value}>
                                        {value} {isMetric ? 'km' : 'mi'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-section">
                            <label>Difficulty</label>
                            <div className="difficulty-options">
                                {difficultyOptions.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        className={filters.difficulty.includes(level) ? 'active' : ''}
                                        onClick={() => {
                                            const newDifficulty = filters.difficulty.includes(level)
                                                ? filters.difficulty.filter(d => d !== level)
                                                : [...filters.difficulty, level];
                                            handleFilterChange('difficulty', newDifficulty);
                                        }}
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <label>Duration</label>
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

                        <div className="filter-section">
                            <label>Sort By</label>
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
                )}
            </div>
        </div>
    );
};

export default SearchBar;
