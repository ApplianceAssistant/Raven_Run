import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadGame } from '../../../gameplay/services/gameplayService';
import { getDownloadedGame } from '../../../../utils/localStorageUtils';
import './GameCard.scss';

const GameCard = ({ 
    id, 
    title, 
    difficulty, 
    distance, 
    rating, 
    ratingCount, 
    duration, 
    description, 
    tags,
    totalChallenges
}) => {
    const navigate = useNavigate();
    const [isDownloaded, setIsDownloaded] = useState(false);

    useEffect(() => {
        // Check if game is already downloaded
        const downloadedGame = getDownloadedGame(id);
        setIsDownloaded(!!downloadedGame);
    }, [id]);

    const handleClick = async () => {
        try {
            // Download the game first
            await downloadGame(id);
            setIsDownloaded(true);
            // Then navigate to the game page
            navigate(`/game/${id}`);
        } catch (error) {
            console.error('Error downloading game:', error);
            // Still navigate to game page, it will handle the error
            navigate(`/game/${id}`);
        }
    };

    const formatDuration = (mins) => {
        if (mins < 60) return `${mins} mins`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    };

    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    return (
        <div className="game-card" onClick={handleClick}>
            <div className="game-image">
                <div className={`difficulty-badge ${difficulty}`}>
                    {difficulty}
                </div>
                <div className="distance-badge">
                    <i className="fas fa-route"></i> {distance}
                </div>
                <div className="challenge-count">
                    {totalChallenges}
                </div>
                {isDownloaded && <span className="downloaded" title="Available Offline">📱</span>}
            </div>
            <div className="game-info">
                <h3>{title}</h3>
                <div className="rating">
                    <span className="stars">{'★'.repeat(Math.round(rating))}</span>
                    <span className="rating-count">({ratingCount})</span>
                </div>
                <p className="description">{truncateDescription(description)}</p>
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
