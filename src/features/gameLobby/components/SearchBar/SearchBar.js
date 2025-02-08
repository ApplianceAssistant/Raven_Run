import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.scss';

const SearchBar = ({ onSearch, onFilterToggle, isFilterVisible, filters = {}, onFilterChange, resultCount }) => {
    const [query, setQuery] = useState('');
    const searchPanelRef = useRef(null);

    const handleClickOutside = (event) => {
        if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
            onFilterToggle(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onFilterToggle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted with query:', query);
        onSearch(query);
    };

    const handleFilterChange = (field, value) => {
        console.log('Filter change initiated:', { field, value });
        console.log('Current filters before update:', filters);
        
        const newFilters = {
            ...filters,
            [field]: value
        };

        // If location is set to 'any', ensure location-related fields remain null
        if (filters?.locationFilter === 'any') {
            newFilters.radius = null;
            newFilters.latitude = null;
            newFilters.longitude = null;
            console.log('Location is "any", nullifying location fields');
        }

        console.log('New filters after update:', newFilters);
        onFilterChange(newFilters);
    };

    const difficultyOptions = ['any', 'easy', 'medium', 'hard'];
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

    const [locationFilter, setLocationFilter] = useState(filters?.locationFilter || 'any');
    const [radius, setRadius] = useState(filters?.radius || 50);

    const handleLocationChange = (value) => {
        console.log('Location change initiated:', value);
        setLocationFilter(value);
        
        // Clear location-related filters if 'any' is selected
        if (value === 'any') {
            const newFilters = {
                ...filters,
                locationFilter: 'any',
                radius: null,
                latitude: null,
                longitude: null
            };
            console.log('Setting location to "any", new filters:', newFilters);
            onFilterChange(newFilters);
        } else {
            // Get location for 'mylocation'
            console.log('Getting current location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newFilters = {
                        ...filters,
                        locationFilter: value,
                        radius: radius,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log('Location obtained, new filters:', newFilters);
                    onFilterChange(newFilters);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Reset to 'any' if location access fails
                    setLocationFilter('any');
                    const newFilters = {
                        ...filters,
                        locationFilter: 'any',
                        radius: null,
                        latitude: null,
                        longitude: null
                    };
                    console.log('Location error, resetting to "any":', newFilters);
                    onFilterChange(newFilters);
                }
            );
        }
    };

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

                    {isFilterVisible && (
                        <div className="filter-panel">
                            {resultCount !== undefined && (
                                <div className="result-count">
                                    {resultCount} {resultCount === 1 ? 'game' : 'games'} found
                                </div>
                            )}
                            <div className="filter-content">
                                <div className="filter-group">
                                    <div className="location-filter">
                                        <select 
                                            value={locationFilter}
                                            onChange={(e) => handleLocationChange(e.target.value)}
                                            className="location-filter"
                                        >
                                            <option value="any">Any Location</option>
                                            <option value="mylocation">Near My Location</option>
                                        </select>

                                        {locationFilter === 'mylocation' && (
                                            <select
                                                value={radius}
                                                onChange={(e) => setRadius(Number(e.target.value))}
                                                className="radius-select"
                                            >
                                                <option value="5">Within 5 km</option>
                                                <option value="10">Within 10 km</option>
                                                <option value="25">Within 25 km</option>
                                                <option value="50">Within 50 km</option>
                                            </select>
                                        )}
                                    </div>

                                    <div className="difficulty-filter">
                                        <label>Difficulty</label>
                                        <div className="difficulty-options">
                                            {difficultyOptions.map(diff => {
                                                const isAny = diff === 'any';
                                                const isActive = isAny ? 
                                                    !filters?.difficulty || filters.difficulty === 'any' : 
                                                    filters?.difficulty === diff;
                                                
                                                return (
                                                    <button
                                                        key={diff}
                                                        type="button"
                                                        className={`difficulty-btn ${isActive ? 'active' : ''}`}
                                                        onClick={() => {
                                                            handleFilterChange('difficulty', diff === 'any' ? null : diff);
                                                        }}
                                                    >
                                                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="time-filter">
                                        <label>Duration</label>
                                        <select
                                            value={filters?.duration || 'any'}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                handleFilterChange('duration', value);
                                            }}
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
                                            value={filters?.sortBy}
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
                        </div>
                    )}
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