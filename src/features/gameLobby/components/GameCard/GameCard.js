import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faClock, faRoute, faFlagCheckered, faSun } from '@fortawesome/free-solid-svg-icons';
import { getDownloadedGame } from '../../../../utils/localStorageUtils';
import { getLargeDistanceUnit, convertDistance } from '../../../../utils/unitConversion';
import { cleanText, API_URL } from '../../../../utils/utils';
import './GameCard.scss';

const GameCard = ({
    id,
    gameId,
    title,
    difficulty_level,
    distance,
    avg_rating,
    ratingCount,
    duration,
    description,
    tags,
    challenges = [],
    creator_name,
    inProgress = false,
    image_url,
    dayOnly = false,
    onClick
}) => {
    const navigate = useNavigate();
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isMetric, setIsMetric] = useState(() => {
        const savedUnitSystem = localStorage.getItem('unitSystem');
        return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
    });

    useEffect(() => {
        const downloadedGame = getDownloadedGame(gameId || id);
        setIsDownloaded(!!downloadedGame);
    }, [gameId, id]);

    const handleCardClick = () => {
        if (onClick) {
            onClick(gameId || id);
        } else {
            navigate(`/gamedescription/${gameId || id}`);
        }
    };

    const formatDuration = (mins) => {
        if (mins < 60) return `${mins} mins`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    };

    const formatDistance = (distanceValue) => {
        if (distanceValue === null || distanceValue === undefined) return 'Distance N/A';
        // Parse distance to number if it's a string
        const distance = typeof distanceValue === 'string' ? parseFloat(distanceValue) : distanceValue;
        if (isNaN(distance)) return 'Distance N/A';
        
        const unit = getLargeDistanceUnit(isMetric);
        // Match HuntDescription's conversion logic - treat input as metric (kilometers)
        const converted = convertDistance(distance, true, isMetric);
        return `${converted.toFixed(1)} ${unit}`;
    };

    const renderStars = (rating) => {
        if (rating) {
            return [...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                const filled = ratingValue <= rating;
                return (
                    <FontAwesomeIcon
                        key={index}
                        icon={faStar}
                        className={`star-icon ${filled ? 'filled' : ''}`}
                    />
                );
            });
        } else {
            return <div><p className="no-ratings">No ratings yet</p></div>;
        }
    };

    return (
        <div
            className={`game-card ${isDownloaded ? 'downloaded' : ''} ${inProgress ? 'in-progress' : ''}`}
            onClick={handleCardClick}
        >
            <div className="game-image">
                {image_url ? (
                    <div
                        className="game-thumbnail"
                        style={{ backgroundImage: `url(${API_URL}${image_url})` }}
                        aria-label={`Thumbnail for ${title}`}
                    />
                ) : (
                    <div className="game-thumbnail-placeholder" />
                )}
                <div className={`difficulty-badge card-header-item`}>
                    {difficulty_level || 'Medium'}
                </div>
                <div className="creator-name card-header-item" title="Created by">
                    Created by: {creator_name}
                </div>
                {distance !== null && (
                    <div className="distance-badge card-header-item">
                        <FontAwesomeIcon icon={faRoute} />
                        {formatDistance(distance)}
                    </div>
                )}
                <div className="challenge-count card-header-item">
                    <FontAwesomeIcon icon={faFlagCheckered} />
                    {challenges.length}
                </div>
            </div>
            <div className="game-info">
                <h3>{title}</h3>
                <div className="game-card-description">
                    {cleanText(description, { maxLength: 100, truncationSuffix: '...' })}
                </div>
                <div className="meta-info">
                    <div className="tags">
                        <span className="duration">
                            <FontAwesomeIcon icon={faClock} />
                            {formatDuration(duration)}
                        </span>
                        {dayOnly && (
                            <div className="day-only-badge" title="Daytime Only">
                                <FontAwesomeIcon icon={faSun} />
                            </div>
                        )}
                        {tags.map((tag, index) =>
                            typeof tag === 'string' ? (
                                <span key={index} className="tag">{tag}</span>
                            ) : (
                                tag // For icon elements
                            )
                        )}
                    </div>
                    <div className="game-meta">
                        {isDownloaded && (
                            <div className="offline-indicator">Available Offline</div>
                        )}
                        {inProgress && (
                            <div className="progress-badge">
                                In Progress
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
