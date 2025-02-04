import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadedGame } from '../../../../utils/localStorageUtils';
import { getLargeDistanceUnit, convertDistance } from '../../../../utils/unitConversion';
import { cleanText } from '../../../../utils/utils';
import './GameCard.scss';

const GameCard = ({ 
    id, 
    title, 
    difficulty, 
    distance, 
    avg_rating, 
    ratingCount, 
    duration, 
    description, 
    tags,
    challenges = [],
    creatorName,
    inProgress = false,
    onClick
}) => {
    const navigate = useNavigate();
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isMetric, setIsMetric] = useState(() => {
        const savedUnitSystem = localStorage.getItem('unitSystem');
        return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
    });

    useEffect(() => {
        const downloadedGame = getDownloadedGame(id);
        setIsDownloaded(!!downloadedGame);
    }, [id]);

    const handleCardClick = () => {
        console.log('Card clicked, onClick handler:', !!onClick);
        if (onClick) {
            console.log('Calling onClick with id:', id);
            onClick(id);
        } else {
            console.log('Navigating to game description:', id);
            navigate(`/gamedescription/${id}`);
        }
    };

    const formatDuration = (mins) => {
        if (mins < 60) return `${mins} mins`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    };

    const formatDistance = (distanceValue) => {
        if (distanceValue === null) return 'Distance N/A';
        const unit = isMetric ? 'km' : 'mi';
        return `${distanceValue.toFixed(1)} ${unit}`;
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`} className="star full" />);
        }
        
        // Add half star if needed
        if (hasHalfStar) {
            stars.push(<span key="half" className="star half" />);
        }
        
        // Add empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty" />);
        }
        
        return <span className="stars">{stars}</span>;
    };

    return (
        <div 
            className={`game-card ${isDownloaded ? 'downloaded' : ''} ${inProgress ? 'in-progress' : ''}`}
            onClick={handleCardClick}
        >
            <div className="game-image">
                <div className={`difficulty-badge ${difficulty}`}>
                    {difficulty}
                </div>
                <div className="creator-name" title="Created by">
                    Created by: {creatorName}
                </div>
                {distance !== null && (
                    <div className="distance-badge">
                        <i className="fas fa-route"></i>
                        {formatDistance(convertDistance(distance || 0, true, isMetric))}
                    </div>
                )}
                <div className="challenge-count">
                    <i className="fas fa-flag-checkered"></i>
                    {challenges.length}
                </div>
                {isDownloaded && <span className="downloaded" title="Available Offline">📱</span>}
                {inProgress && (
                    <div className="progress-badge">
                        In Progress
                    </div>
                )}
            </div>
            <div className="game-info">
                <h3>{title}</h3>
                <div className="rating">
                    {renderStars(avg_rating)}
                    {ratingCount > 0 && <span className="rating-count">({ratingCount})</span>}
                </div>
                <div className="game-card-description">
                    {cleanText(description, { maxLength: 100, truncationSuffix: '...' })}
                </div>
                <div className="meta-info">
                    <span className="duration">
                        <i className="far fa-clock"></i>
                        {formatDuration(duration)}
                    </span>
                    <div className="tags">
                        {tags.map((tag, index) => 
                            typeof tag === 'string' ? (
                                <span key={index} className="tag">{tag}</span>
                            ) : (
                                tag // For icon elements
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
