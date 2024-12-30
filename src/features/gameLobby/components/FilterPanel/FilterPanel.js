import React from 'react';
import './FilterPanel.scss';

const FilterPanel = ({ isVisible, filters, onFilterChange }) => {
    if (!isVisible) return null;

    const handleChange = (field, value) => {
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
        <div className="filter-panel">
            <div className="filter-group">
                <div className="location-filter">
                    <input
                        type="text"
                        placeholder="Location"
                        value={filters.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                    />
                    <select
                        value={filters.radius}
                        onChange={(e) => handleChange('radius', e.target.value)}
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
                                className={filters.difficulty.includes(diff) ? 'active' : ''}
                                onClick={() => {
                                    const newDifficulties = filters.difficulty.includes(diff)
                                        ? filters.difficulty.filter(d => d !== diff)
                                        : [...filters.difficulty, diff];
                                    handleChange('difficulty', newDifficulties);
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
                        onChange={(e) => handleChange('duration', e.target.value)}
                    >
                        {durationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="sort-options">
                <label>Sort by:</label>
                <select
                    value={filters.sortBy}
                    onChange={(e) => handleChange('sortBy', e.target.value)}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FilterPanel;
