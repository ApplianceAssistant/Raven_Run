import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';

function ThankYou() {
    return (
        <div className="base-page">
            <div className="content-wrapper">
                <div className="content">
                    <ScrollableContent maxHeight="80vh">
                        <div className="base-container">
                            <h1>Thank You for Joining the CrowTours Flock!</h1>
                            <p>We're thrilled to have you as part of our community of explorers and adventure-seekers.</p>
                            <h2>Your Support Means the World</h2>
                            <p>Your subscription helps us create more exciting quests, uncover hidden gems, and bring adventure to every corner of the map. We're excited about the journey ahead and can't wait to share it with you.</p>

                            <h2>What's Next?</h2>
                            <ul>
                                <li>What would you like to see next? Let us know!</li>
                                <li>Want to create your own Scavengerhunts? We are working on a "Create your Own Hunt". Design your own adventure and invite friends to join the fun.</li>
                            </ul>
                            <h2>Stay Connected</h2>
                            <ul>
                                <li>Follow us on social media @CrowTours</li>
                                <li>Share your experiences using #CrowTours</li>
                                <li>Follow us on <a
                                    href="https://www.facebook.com/CrowTours/"
                                    target="_blank"
                                    description="Crow Tours Facebook Page"
                                    rel="noopener noreferrer"
                                    className="social-links">Facebook</a>
                                </li>
                                <li>Join the FB Group <a
                                    href="https://www.facebook.com/groups/crowtours"
                                    target="_blank"
                                    description="CrowTours IRL Games Group"
                                    rel="noopener noreferrer"
                                    className="social-links">CrowTours IRL Games</a></li>
                            </ul>

                            <p>Remember, in the CrowTours flock, every day is an opportunity for discovery. Thank you for spreading your wings with us!</p>
                            <p><strong>Happy exploring!</strong></p>
                            <p><em>The CrowTours Team</em></p>
                            <hr></hr>
                            <p>"Adventure awaits around every corner. Let's find it together!"</p>

                        </div>
                    </ScrollableContent>
                </div>
            </div>
        </div>
    );
}

export default ThankYou;