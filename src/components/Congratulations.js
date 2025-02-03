// src/components/Congratulations.js
import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faChevronDown, faChevronUp, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';
import { API_URL, authFetch } from '../utils/utils';
import ScrollableContent from './ScrollableContent';
import { useMessage } from '../utils/MessageProvider';
import { getPlaytestState } from '../utils/localStorageUtils';
import { handlePlaytestQuit } from '../features/gameCreation/services/gameCreatorService';
import '../css/Congratulations.scss';

const Congratulations = () => {
    const [visible, setVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [bugReport, setBugReport] = useState('');
    const [currentDifficulty, setCurrentDifficulty] = useState('medium');
    const [suggestedDifficulty, setSuggestedDifficulty] = useState('');
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showError, showSuccess } = useMessage();
    
    const gameId = location.state?.fromGame;

    useEffect(() => {
        setVisible(true);
        if (gameId) {
            fetchGameDetails();
        }
    }, [gameId]);

    const fetchGameDetails = async () => {
        try {
            const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get&gameId=${gameId}`);
            if (!response.ok) throw new Error('Failed to fetch game details');
            const data = await response.json();
            if (data.success && data.game) {
                setCurrentDifficulty(data.game.difficulty_level || 'medium');
            }
        } catch (error) {
            console.error('Error fetching game details:', error);
            showError('Failed to load game details');
        }
    };

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => navigate('/lobby'), 500);
    };

    const handleRatingSubmit = async () => {
        if (rating === 0) {
            showError('Please select a rating before submitting feedback');
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit game rating and feedback
            const ratingResponse = await authFetch(`${API_URL}/server/api/games/feedback.php`, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'rate',
                    gameId: gameId || '',
                    rating,
                    review: comment || '',
                    suggestedDifficulty: suggestedDifficulty || ''
                })
            });

            if (!ratingResponse.ok) throw new Error('Failed to submit rating');

            // Submit bug report if provided
            if (bugReport.trim()) {
                const bugResponse = await authFetch(`${API_URL}/server/api/games/feedback.php`, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'report_bug',
                        gameId: gameId || '',
                        description: bugReport
                    })
                });

                if (!bugResponse.ok) throw new Error('Failed to submit bug report');
            }

            showSuccess('Thank you for your feedback!');
            setHasSubmitted(true);
            setTimeout(handleClose, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            showError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        return [...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            const filled = ratingValue <= (hoveredRating || rating);
            return (
                <FontAwesomeIcon
                    key={index}
                    icon={faStar}
                    className={`star-icon ${filled ? 'filled' : ''}`}
                    onMouseEnter={() => setHoveredRating(ratingValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(ratingValue)}
                />
            );
        });
    };

    return (
        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 80)" className={`congratulations-container ${visible ? 'visible' : ''}`}>
            <h1>Congratulations!</h1>
            <p>You've completed the game!</p>
            
            {!hasSubmitted && (
                <div className="feedback-section">
                    <div className="rating-container">
                        <h2>Rate Your Experience</h2>
                        <div className="stars">{renderStars()}</div>
                    </div>

                    <div className="feedback-form">
                        <button 
                            className="expand-button"
                            onClick={() => setIsFormExpanded(!isFormExpanded)}
                        >
                            {isFormExpanded ? 'Hide Feedback Form ' : 'Show Feedback Form '}
                            <FontAwesomeIcon icon={isFormExpanded ? faChevronUp : faChevronDown} />
                        </button>

                        {isFormExpanded && (
                            <div className="form-content">
                                <div className="form-group">
                                    <label>Comments:</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your thoughts about the game..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Report a Bug:</label>
                                    <textarea
                                        value={bugReport}
                                        onChange={(e) => setBugReport(e.target.value)}
                                        placeholder="Describe any issues you encountered..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Difficulty Level:</label>
                                    <p>Current difficulty: {currentDifficulty}</p>
                                    <select
                                        value={suggestedDifficulty}
                                        onChange={(e) => setSuggestedDifficulty(e.target.value)}
                                    >
                                        <option value="">Do you agree with this difficulty?</option>
                                        <option value="easy">Should be Easy</option>
                                        <option value="medium">Should be Medium</option>
                                        <option value="hard">Should be Hard</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <button
                            className="submit-button"
                            onClick={handleRatingSubmit}
                            disabled={isSubmitting || rating === 0 || getPlaytestState()}
                        >
                            {isSubmitting ? 'Submitting...' : 
                             getPlaytestState() ? 'Feedback unavailable for playtest' : 'Submit Feedback'}
                        </button>
                    </div>
                </div>
            )}

            <div className="social-links">
                <p>
                    <a
                        href="https://www.facebook.com/CrowTours/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-link"
                    >
                        Join the Flock!
                    </a>
                    {getPlaytestState() && (
                        <button
                            className="button-link"
                            onClick={() => {
                                handlePlaytestQuit(gameId, navigate);
                            }}
                        >
                            <FontAwesomeIcon icon={faPenToSquare} /> Quit Playtest
                        </button>
                    )}
                </p>
            </div>

            <div className="support-us">
                <p>Support CrowTours Development and Fuel new adventures! Your contribution helps create exciting quests, improve features, and keep the fun free.</p>
                <div className="button-container">
                    <a
                        href="https://buy.stripe.com/14k9ErgTG5689KUeV2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-link"
                    >
                        $30
                    </a>
                    <a
                        href="https://donate.stripe.com/fZe7wj1YMgOQg9i6op"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-link"
                    >
                        $20
                    </a>
                    <a
                        href="https://donate.stripe.com/9AQ4k78na7ege1a3ce"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-link"
                    >
                        $10
                    </a>
                </div>
            </div>
        </ScrollableContent>
    );
};

export default Congratulations;