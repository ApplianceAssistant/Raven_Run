import React from 'react';
import ScrollableContent from './ScrollableContent';
import '../css/Documentation.scss';

function Documentation() {
    return (
        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 90)">
            <div className="documentation-container">
                <h1>Crow Tours Documentation</h1>
                
                <section className="doc-section">
                    <h2>Getting Started</h2>
                    <h3>Creating an Account</h3>
                    <ul>
                        <li>Click on "Create Profile" in the navigation menu</li>
                        <li>Fill in your details and create a password</li>
                        <li>Verify your email address</li>
                    </ul>

                    <h3>Logging In</h3>
                    <ul>
                        <li>Click "Log In" in the navigation menu</li>
                        <li>Enter your email and password</li>
                        <li>You'll be redirected to the main navigation screen</li>
                    </ul>
                </section>

                <section className="doc-section">
                    <h2>Playing Games</h2>
                    <h3>Finding a Game</h3>
                    <ul>
                        <li>Click "Find a Game" in the main menu</li>
                        <li>Browse available games in the lobby</li>
                        <li>Select a game to start playing</li>
                    </ul>

                    <h3>Challenge Types</h3>
                    <ul>
                        <li><strong>Travel Challenges:</strong> Navigate to specific locations</li>
                        <li><strong>Story Challenges:</strong> Read and interact with narrative content</li>
                        <li><strong>Multiple Choice:</strong> Answer questions with multiple options</li>
                        <li><strong>True/False:</strong> Answer simple true or false questions</li>
                    </ul>
                </section>

                <section className="doc-section">
                    <h2>Creating Games</h2>
                    <h3>Game Creation Process</h3>
                    <ul>
                        <li>Click "Create" in the main menu</li>
                        <li>Fill in basic game information</li>
                        <li>Add challenges one by one</li>
                        <li>Set locations for travel challenges</li>
                        <li>Preview and test your game</li>
                    </ul>

                    <h3>Challenge Creation Tips</h3>
                    <ul>
                        <li>Keep instructions clear and concise</li>
                        <li>Test all locations before publishing</li>
                        <li>Include engaging descriptions</li>
                        <li>Consider accessibility in your design</li>
                    </ul>
                </section>

                <section className="doc-section">
                    <h2>Settings and Preferences</h2>
                    <ul>
                        <li>Adjust text-to-speech settings</li>
                        <li>Change theme preferences</li>
                        <li>Modify notification settings</li>
                        <li>Update profile information</li>
                    </ul>
                </section>

                <section className="doc-section">
                    <h2>Troubleshooting</h2>
                    <h3>Common Issues</h3>
                    <ul>
                        <li>Location not updating: Check device GPS settings</li>
                        <li>Can't create game: Ensure all required fields are filled</li>
                        <li>Login issues: Verify email and password</li>
                    </ul>
                </section>
            </div>
        </ScrollableContent>
    );
}

export default Documentation;
