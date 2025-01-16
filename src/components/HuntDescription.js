import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScrollableContent from './ScrollableContent';
import TextToSpeech from './TextToSpeech';
import ModalAgreement from './ModalAgreement';
import { getUserUnitPreference, cleanText } from '../utils/utils';
import { getLargeDistanceUnit, convertDistance } from '../utils/unitConversion';
import { useSettings } from '../utils/SettingsContext';
import { loadGame, downloadGame } from '../features/gameplay/services/gameplayService';
import { getDownloadedGame } from '../utils/localStorageUtils';

import '../css/HuntDescription.scss';

const HuntDescription = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [autoPlayTrigger, setAutoPlayTrigger] = useState(0);
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { settings } = useSettings();
    const isMetric = getUserUnitPreference();

    useEffect(() => {
        const getGameData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Try to load the game (this will check local storage first)
                const gameData = await loadGame(gameId);
                
                if (!gameData) {
                    throw new Error('Game not found');
                }

                // Transform game data to match GameCard format
                const transformedGame = {
                    ...gameData,  // Keep all original properties
                    title: gameData.title || 'Untitled Adventure',
                    difficulty: gameData.difficulty || 'Normal',
                    distance: typeof gameData.distance === 'number' ? gameData.distance : 
                             typeof gameData.distance === 'string' ? parseFloat(gameData.distance) : 0,
                    estimatedTime: parseInt(gameData.estimatedTime) || 60,
                    creator_name: gameData.creator_name || 'Anonymous',
                    description: gameData.description || 'No description available',
                    isPublic: gameData.isPublic || gameData.public || false,
                    dayOnly: Boolean(gameData.dayOnly),
                    startLocation: gameData.startLocation || null
                };

                setGame(transformedGame);
            } catch (error) {
                console.error('Error getting game data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getGameData();
    }, [gameId]);

    const handleEnterHunt = () => {
        setIsModalOpen(true);
    };

    const handleAgree = async () => {
        try {
            // Always download/update the game when starting
            await downloadGame(gameId);
            setIsModalOpen(false);
            navigate(`/game/${gameId}/challenge/0`);
        } catch (error) {
            console.error('Error preparing game:', error);
            setError('Failed to prepare game for offline play. Please try again.');
            setIsModalOpen(false);
        }
    };

    const disclaimerContent = (
        <div>
            <p>CrowTours.com reminds you to <b>HAVE FUN</b> but also remember to <b>BE SAFE</b>!</p>
            <p>By participating in CrowTours.com's real-world scavenger hunts, you acknowledge and agree to the following:</p>
            <ol className="align-left">
                <li><b>Safety First:</b> You are solely responsible for your safety and the safety of others while participating. Always exercise caution, remain aware of your surroundings, and act responsibly.</li>
                <li><b>Compliance with Laws:</b> You agree to comply with all applicable local, state, and national laws, including traffic regulations and property laws. This includes, but is not limited to:
                    <ul>
                        <li><b>Safe Driving:</b> Refrain from using the CrowTours app or website while operating a vehicle.</li>
                        <li><b>No Trespassing:</b> Do not enter private property without permission.</li>
                        <li><b>Respect for Public Spaces:</b> Treat all historical sites, monuments, and public spaces with care and respect.</li>
                    </ul>
                </li>
                <li><b>Assumption of Risk:</b> You acknowledge that participating in real-world activities, including scavenger hunts, carries inherent risks (including but not limited to physical injury, property damage, and interaction with unknown locations or environments). By participating, you voluntarily assume all such risks.</li>
                <li><b>Limitation of Liability:</b> CrowTours.com, its creators, affiliates, and partners shall not be held liable for any injuries, accidents, property damage, legal consequences, or other adverse outcomes resulting from participation in any scavenger hunt or the use of this website/application.</li>
                <li><b>Personal Responsibility:</b>  You agree that participation is entirely voluntary and at your own risk. You further agree that you and any companions or participants are solely responsible for your actions and decisions while engaging in the scavenger hunt or using the CrowTours platform.</li>
                <li><b>Indemnification:</b> You agree to indemnify and hold harmless CrowTours.com, its creators, employees, and affiliates from any claims, demands, or damages, including legal fees, arising from your participation in any event or use of the website/application.</li>
            </ol>
        </div>
    );

    if (loading) {
        return <div>Loading game details...</div>;
    }

    if (error || !game) {
        return <div>Game not found</div>;
    }
    return (
        <div className="hunt-description">
            <div className="hunt-header">
                <h1>{game.title}</h1>
                <div className="meta-info">
                    <span className="difficulty">Difficulty: {game.difficulty}</span>
                    <span className="duration">Duration: {game.estimatedTime} minutes</span>
                    <span className="distance"><i className="fas fa-route"></i> Distance: {convertDistance(game.distance, true, isMetric)} {getLargeDistanceUnit(isMetric)}</span>
                </div>
                <div className="creator">Created by: {game.creator_name || 'Anonymous'}</div>
            </div>
            <ScrollableContent maxHeight="45vh">
                <div className="hunt-content">
                    <div className="description">
                        {cleanText(game.description, { asJsx: true })}
                    </div>
                </div>
            </ScrollableContent>
            <div className="button-container">
                <TextToSpeech
                    text={game.description}
                    autoPlayTrigger={settings.autoSpeak}
                />
                <button className="primary" onClick={handleEnterHunt}>
                    Start Hunt
                </button>
            </div>
            

            <ModalAgreement
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAgree={handleAgree}
                title="Disclaimer"
                content={disclaimerContent}
            />
        </div>
    );
};

export default HuntDescription;