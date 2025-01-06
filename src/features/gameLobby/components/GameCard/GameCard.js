import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadGame } from '../../../gameplay/services/gameplayService';
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
    creatorName
}) => {
    const navigate = useNavigate();
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isMetric, setIsMetric] = useState(() => {
        const savedUnitSystem = localStorage.getItem('unitSystem');
        return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
    });

    useEffect(() => {
        // Check if game is already downloaded
        const downloadedGame = getDownloadedGame(id);
        setIsDownloaded(!!downloadedGame);
    }, [id]);

    const handleCardClick = async () => {
        try {
            console.log('GameCard clicked, current data:', {
                id, distance, parsed_distance: parseFloat(distance)
            });
            // Ensure game is downloaded before navigation
            if (!isDownloaded) {
                await downloadGame(id);
            }
            navigate(`/gamedescription/${id}`);
        } catch (error) {
            console.error('Error preparing game:', error);
            // Navigate anyway, HuntDescription will handle the retry
            navigate(`/gamedescription/${id}`);
        }
    };

    const formatDuration = (mins) => {
        if (mins < 60) return `${mins} mins`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    };

    return (
        <div className="game-card" onClick={handleCardClick}>
            <div className="game-image">
                <div className={`difficulty-badge ${difficulty}`}>
                    {difficulty}
                </div>
                <div className="creator-name" title="Created by">
                    Created by: {creatorName}
                </div>
                <div className="distance-badge">
                    <i className="fas fa-route"></i>
                    {distance ? `${Math.round(convertDistance(distance, true, isMetric))} ${getLargeDistanceUnit(isMetric)}` : '0 km'}
                </div>
                <div className="challenge-count">
                    <i className="fas fa-flag-checkered"></i>
                    {challenges.length}
                </div>
                {isDownloaded && <span className="downloaded" title="Available Offline">📱</span>}
            </div>
            <div className="game-info">
                <h3>{title}</h3>
                <div className="rating">
                    <span className="stars">{'★'.repeat(Math.round(avg_rating))}</span>
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
