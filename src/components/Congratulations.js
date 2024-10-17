// src/components/Congratulations.js
import React, { useEffect, useState } from 'react';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></link>

const Congratulations = ({ onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => navigate('/lobby'), 500); // Navigate after fade-out animation
    };

    return (
        <div className="content-wrapper">
            <div className="spirit-guide large">
                <div className={`congratulations-container ${visible ? 'visible' : ''}`}>
                    <div className="icon-container">
                        <div className="floating-icon">
                            <i className="fa-solid fa-ghost"></i>
                        </div>
                    </div>
                    <h1>The spirits have been appeased!</h1>
                    <p>Your bravery and wit have led you to victory in the world of shadow.</p>
                    <p>Let your friends know about your paranormal prowess!</p>
                    <p>
                        <a
                            href="https://www.facebook.com/CrowTours/"
                            target="_blank"
                            description="Crow Tours Facebook Page"
                            rel="noopener noreferrer"
                            className="button-link"
                        >
                            Join the Facebook Flock!
                        </a>
                    </p>

                    <h2>Enjoy the hunt?</h2>
                    <p>Support CrowTours Development and Fuel new adventures! Your contribution helps create exciting quests, improve features, and keep our app free.</p>
                    <div className="button-container">
                        <a
                            href="https://donate.stripe.com/dR6g2P0UIdCEbT2148"
                            target="_blank"
                            description="Donate 30 to CrowTours"
                            rel="noopener noreferrer"
                            className="button-link"
                        >
                            $30
                        </a>
                        <a
                            href="https://donate.stripe.com/fZe7wj1YMgOQg9i6op"
                            target="_blank"
                            description="Donate 20 to CrowTours"
                            rel="noopener noreferrer"
                            className="button-link"
                        >
                            $20
                        </a>
                        <a
                            href="https://donate.stripe.com/9AQ4k78na7ege1a3ce"
                            target="_blank"
                            description="Donate 20 to CrowTours"
                            rel="noopener noreferrer"
                            className="button-link"
                        >
                            $10
                        </a>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Congratulations;