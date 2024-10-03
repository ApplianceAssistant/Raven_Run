import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paths } from '../data/challenges';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';
import ScrollableContent from './ScrollableContent';
import TextToSpeech from './TextToSpeech';

const HuntDescription = () => {
    const { pathId } = useParams();
    const navigate = useNavigate();

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

    const handleEnterHunt = () => {
        navigate(`/path/${pathId}/challenge/0`);
    };

    if (!hunt) {
        return <div>Hunt not found</div>;
    }

    return (
        <div className="content-wrapper">
            <div className="spirit-guide large">
                <div className="hunt-description content">
                    <h2>{hunt.name}</h2>
                    <ScrollableContent maxHeight="60vh">
                        <p>{hunt.description}</p>
                    </ScrollableContent>
                </div>
            </div>
            <div className={`button-container-bottom visible`}>
                {(hunt.description) &&
                    <TextToSpeech text={hunt.description} />
                }
                <button onClick={handleEnterHunt} className="enter-hunt-button">
                    Start The Hunt
                </button>
            </div>
        </div>
    );
};

export default HuntDescription;