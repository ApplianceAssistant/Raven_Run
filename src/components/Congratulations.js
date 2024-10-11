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
                    <div className="button-container">
                        <a
                            href="https://www.facebook.com/CrowTours/"
                            target="_blank"
                            description="Crow Tours Facebook Page"
                            rel="noopener noreferrer"
                            className="facebook-link"
                        >
                            Share photos & give us a like!
                        </a>
                        <a href="https://buy.stripe.com/bIY6sf6f2dCE1eoaEE"
                            target="_blank"
                            description="Support the developer"
                            rel="noopener noreferrer"
                            className="support_dev"
                        >
                            Support the developer
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Congratulations;