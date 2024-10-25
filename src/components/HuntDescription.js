import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paths } from '../data/challenges';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';
import ScrollableContent from './ScrollableContent';
import TextToSpeech from './TextToSpeech';
import ModalAgreement from './ModalAgreement';
import { analyzeChallenges } from '../utils/challengeAnalysis';
import { getUserUnitPreference } from '../utils/utils';
import { useSettings } from '../utils/SettingsContext';

const HuntDescription = () => {
    const { pathId } = useParams();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [huntAnalysis, setHuntAnalysis] = useState(null);
    const [autoPlayTrigger, setAutoPlayTrigger] = useState(0);
    const { settings } = useSettings();

    const getHuntData = () => {
        const numericPathId = parseInt(pathId, 10);
        let hunt = paths.find(p => p.id === numericPathId);
        if (!hunt) {
            const customPaths = getGamesFromLocalStorage();
            hunt = customPaths.find(p => p.id === numericPathId);
        }
        return hunt;
    };

    const hunt = getHuntData();

    useEffect(() => {
        if (hunt) {
            const isMetric = getUserUnitPreference();
            const analysis = analyzeChallenges(hunt.challenges, isMetric);
            setHuntAnalysis(analysis);
            setAutoPlayTrigger(prev => prev + 1);
        }
    }, [hunt]);

    const handleEnterHunt = () => {
        setIsModalOpen(true);
    };

    const handleAgree = () => {
        setIsModalOpen(false);
        navigate(`/path/${pathId}/challenge/0`);
    };

    if (!hunt) {
        return <div>Hunt not found</div>;
    }

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
                <li><b>Personal Responsibility:</b>  You agree that participation is entirely voluntary and at your own risk. You further agree that you and any companions or participants are solely responsible for your actions and decisions while engaging in the scavenger hunt or using the CrowTours platform.

                </li>
                <li><b>Indemnification:</b> You agree to indemnify and hold harmless CrowTours.com, its creators, employees, and affiliates from any claims, demands, or damages, including legal fees, arising from your participation in any event or use of the website/application.</li>
            </ol>
        </div>
    );

    return (
        <div className="content-wrapper">
            <div className="spirit-guide large">
                <div className="hunt-description content">
                    <h2>{hunt.name}</h2>
                    {huntAnalysis && (
                        <div className="hunt-analysis">
                            <p>Total Challenges: {huntAnalysis.totalChallenges}</p>
                            {huntAnalysis.maxDistance && (
                                <p>Distance: {huntAnalysis.maxDistance} {huntAnalysis.unit}</p>
                            )}
                        </div>
                    )}
                    <ScrollableContent maxHeight="60vh">
                        {hunt.description && (
                            <p className="challenge-description">
                                {hunt.description.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        {index < hunt.description.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </p>
                        )}
                    </ScrollableContent>
                </div>
            </div>
            <div className={`button-container-bottom visible`}>
                {hunt.description && (
                    <TextToSpeech
                        text={hunt.description}
                        autoPlayTrigger={autoPlayTrigger}
                    />
                )}
                <button onClick={handleEnterHunt} className="enter-hunt-button">
                    Start The Hunt
                </button>
            </div>
            <ModalAgreement
                isOpen={isModalOpen}
                onAgree={handleAgree}
                title="Disclaimer"
                content={disclaimerContent}
            />
        </div>
    );
};

export default HuntDescription;