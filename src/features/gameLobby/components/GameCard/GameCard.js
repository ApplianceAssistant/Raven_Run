import React from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleClick = () => {
        navigate(`/game/${id}`);
    };

    const formatDuration = (mins) => {
        if (mins < 60) return `${mins} mins`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
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
            </div>
            <div className="game-info">
                <h3>{title}</h3>
                <div className="rating">
                    <span className="stars">{'★'.repeat(Math.round(rating))}</span>
                    <span className="rating-count">({ratingCount})</span>
                </div>
                <p className="description">{description}</p>
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
