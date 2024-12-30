import React from 'react';
import './GameCard.scss';

const GameCard = ({ game, onPlay }) => {
    const { 
        title, 
        difficulty, 
        distance, 
        rating, 
        ratingCount, 
        duration, 
        description, 
        tags 
    } = game;

    return (
        <div className="game-card">
            <div className="game-image">
                <span className={`difficulty-badge ${difficulty}`}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <span className="distance-badge">
                    {distance} km
                </span>
            </div>
            
            <div className="game-info">
                <h3>{title}</h3>
                <div className="game-stats">
                    <span className="rating">
                        ★ {rating.toFixed(1)} ({ratingCount})
                    </span>
                    <span className="duration">
                        {duration} min
                    </span>
                </div>
                <p className="description">{description}</p>
                <div className="game-tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                    ))}
                </div>
            </div>

            <button className="play-button" onClick={onPlay}>
                Play Now
            </button>
        </div>
    );
};

export default GameCard;
