import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faUsers, faGamepad, faTrophy } from '@fortawesome/free-solid-svg-icons';
import ScrollableContent from './ScrollableContent';
import '../css/Welcome.scss';

function Welcome() {
    const navigate = useNavigate();

    return (
        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 80)">
            <div className="home-welcome-container">
                <section className="hero">
                    <h1>Welcome to CrowTours</h1>
                    <p className="tagline">Create, Share, and Play Amazing Scavenger Hunts</p>
                    <div className="cta-buttons">
                        <button onClick={() => navigate('/create-profile')} className="cta-button primary">
                            Get Started
                        </button>
                        <button onClick={() => navigate('/log-in')} className="cta-button secondary">
                            Sign In
                        </button>
                    </div>
                </section>

                <section className="features">
                    <h2>Why Choose CrowTours?</h2>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="feature-icon" />
                            <h3>Create Custom Adventures</h3>
                            <p>Design unique scavenger hunts for any location or occasion. Perfect for team building, education, or family fun.</p>
                        </div>
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                            <h3>Build Community</h3>
                            <p>Share your hunts with friends, family, or your local community. Create memorable experiences together.</p>
                        </div>
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faGamepad} className="feature-icon" />
                            <h3>Play Anywhere</h3>
                            <p>Access hunts on any device. Perfect for outdoor adventures, city exploration, or indoor activities.</p>
                        </div>
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faTrophy} className="feature-icon" />
                            <h3>Track Progress</h3>
                            <p>Monitor completion, award points, and celebrate achievements as players complete your hunts.</p>
                        </div>
                    </div>
                </section>

                <section className="use-cases">
                    <h2>Perfect For</h2>
                    <div className="use-case-list">
                        <div className="use-case">
                            <h3>🎓 Education</h3>
                            <p>Make learning fun with interactive educational hunts</p>
                        </div>
                        <div className="use-case">
                            <h3>🏢 Team Building</h3>
                            <p>Create engaging activities for workplace bonding</p>
                        </div>
                        <div className="use-case">
                            <h3>🎉 Events</h3>
                            <p>Design unique experiences for birthdays and celebrations</p>
                        </div>
                        <div className="use-case">
                            <h3>🌆 Tourism</h3>
                            <p>Craft exciting city tours and local adventures</p>
                        </div>
                    </div>
                </section>

                <section className="get-started">
                    <h2>Ready to Create Your First Hunt?</h2>
                    <p>Join our community of creators and start designing unforgettable experiences.</p>
                    <button onClick={() => navigate('/create-profile')} className="cta-button primary">
                        Create Your Free Account
                    </button>
                </section>
            </div>
        </ScrollableContent>
    );
}

export default Welcome;
