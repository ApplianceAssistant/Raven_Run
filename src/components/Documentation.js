import React from 'react';
import ScrollableContent from './ScrollableContent';
import '../css/Documentation.scss';

function Documentation() {
    const handleNavClick = (e) => {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 90)">
            <div className="documentation-container">
                <h1>Crow Tours Documentation</h1>
                
                <nav className="doc-navigation">
                    <ul>
                        <li><a href="#getting-started" onClick={handleNavClick}>Getting Started</a></li>
                        <li><a href="#playing-games" onClick={handleNavClick}>Playing Games</a></li>
                        <li><a href="#creating-games" onClick={handleNavClick}>Creating Games</a></li>
                        <li><a href="#settings-and-preferences" onClick={handleNavClick}>Settings and Preferences</a></li>
                        <li><a href="#troubleshooting" onClick={handleNavClick}>Troubleshooting</a></li>
                    </ul>
                </nav>
                
                <section id="getting-started" className="doc-section">
                    <h2>Getting Started</h2>
                    <h3>Creating an Account</h3>
                    <ul>
                        <li>Click on "Create Profile" in the navigation menu</li>
                        <li>Fill in your details and create a password</li>
                        <li>Verify your email address</li>
                        <li>If you log in with Google or some other platform, you'll be asked to create a trail name</li>
                    </ul>

                    <h3>Logging In</h3>
                    <ul>
                        <li>Click "Log In" in the navigation menu</li>
                        <li>Enter your email and password</li>
                        <li>You'll be redirected to the main navigation screen</li>
                    </ul>

                    <h3>Privacy and Terms of Service</h3>
                    <ul>
                        <li>Privacy Policy: <a href="/privacy">Privacy Policy</a></li>
                        <li>Terms of Service: <a href="/terms">Terms of Service</a></li>
                    </ul>
                </section>

                <section id="playing-games" className="doc-section">
                    <h2>Playing Games</h2>
                    <h3>Finding Games in the Lobby</h3>
                    <ul>
                        <li>Access the Game Lobby through the "Find a Game" option</li>
                        <li>Use the search bar to find specific games by title or keywords</li>
                        <li>Use the gameId search field to find specific games or access private games shared by friends</li>
                        <li>Sort games by various criteria:
                            <ul>
                                <li>Duration</li>
                                <li>Popularity</li>
                                <li>Difficulty Level</li>
                                <li>Location</li>
                            </ul>
                        </li>
                        <li>Filter games using keywords like your city, country, or keywords in the game description</li>
                        <li>Click on a game to view greater detail and start playing</li>
                        <li>Note: Private games will not appear in the Game Lobby until made public by their creator</li>
                        <li>Tip: If you're not finding any games, try setting all filters to "Any" to see all available games</li>
                    </ul>

                    <h3>Playing a Game</h3>
                    <ul>
                        <li>Follow the on-screen instructions for each challenge</li>
                        <li>Use the distance notice and direction to find your way to the required location</li>
                        <li>Complete challenges to progress through the game</li>
                        <li>Note: Games with Day-Only mode can only be played during daylight hours</li>
                    </ul>
                </section>

                <section id="creating-games" className="doc-section">
                    <h2>Creating Games</h2>
                    <h3>Game Creation Process</h3>
                    <ul>
                        <li>Click "Create" in the main menu</li>
                        <li>Fill in basic game information:
                            <ul>
                                <li>Title and description</li>
                                <li>Difficulty level</li>
                                <li>Keywords for searchability</li>
                                <li>Privacy setting (private/public)</li>
                                <li>Day-Only mode setting for locations only accessible during daylight</li>
                            </ul>
                        </li>
                        <li>Add challenges using different types:
                            <ul>
                                <li><strong>Travel Challenges:</strong> Set specific locations players must visit.</li>
                                <ul>
                                    <li>locations are set using latitude/longitude coordinates.</li>
                                    <li>coordinates can be copied directly from Google Maps by right-clicking a point and selecting the coordinates</li>
                                    <li>paste copied coordinates into either lat or long field to set the challenge location</li>
                                    <li>locations can be set manually by entering coordinates or using the search feature or pressing the "Use my Location" button to use your current location</li>
                                    <li>use the "radius" field to set how close the player must be to the location for success.</li>
                                </ul>
                                <li><strong>Challenge Order:</strong> Reorder challenges by dragging challenge cards in the challenge list</li>
                                <li><strong>Story Challenges:</strong> Create narrative content and interactions</li>
                                <li><strong>Multiple Choice:</strong> Design questions with multiple options</li>
                                <li><strong>True/False:</strong> Create simple true/false questions</li>
                                <li><strong>Text Input:</strong> Create questions where players must type the correct answer</li>
                            </ul>
                        </li>
                    </ul>

                    <h3>Playtesting Your Game</h3>
                    <ul>
                        <li>Use the Playtest mode to test your game during development</li>
                        <li>Special creator features in Playtest mode:
                            <ul>
                                <li>Skip location requirements to test all challenges</li>
                                <li>Jump between challenges freely</li>
                                <li>Preview all content as players will see it</li>
                                <li>Test updates in real-time as you make changes</li>
                            </ul>
                        </li>
                    </ul>

                    <h3>Game Optimization Tips</h3>
                    <ul>
                        <li>Add relevant keywords to help players find your game</li>
                        <li>Test all locations and challenges thoroughly</li>
                        <li>Write clear, engaging instructions</li>
                        <li>Consider accessibility in your design</li>
                        <li>Use the playtest function to check content formatting</li>
                        <li>Enable Day-Only mode if your game includes locations that close after dark</li>
                        <li>Keep games private during development and testing</li>
                    </ul>
                </section>

                <section id="settings-and-preferences" className="doc-section">
                    <h2>Settings and Preferences</h2>
                    <ul>
                        <li>Theme preferences:
                            <ul>
                                <li>Toggle between Light and Dark mode</li>
                                <li>Adjust display settings</li>
                            </ul>
                        </li>
                        <li>Measurement preferences:
                            <ul>
                                <li>Choose between Metric (km/m) or Imperial (mi/ft)</li>
                            </ul>
                        </li>
                        <li>Accessibility settings:
                            <ul>
                                <li>Enable/disable Auto-Speak feature</li>
                                <li>Select preferred voice for text-to-speech</li>
                                <li>Test voice settings</li>
                            </ul>
                        </li>
                    </ul>
                </section>

                <section id="troubleshooting" className="doc-section">
                    <h2>Troubleshooting</h2>
                    <h3>Common Issues</h3>
                    <ul>
                        <li>Location not updating: Check device GPS/ location settings</li>
                        <li>Can't create game: Ensure all required fields are have values</li>
                        <li>Login issues: Verify email and password</li>
                        <li>Search not working: Try different keywords or clear filters</li>
                        <li>Don't like the voice: Try different settings</li>
                    </ul>
                </section>
            </div>
        </ScrollableContent>
    );
}

export default Documentation;
