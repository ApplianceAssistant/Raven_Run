import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';
import { handleScroll } from '../utils/utils';

function Create() {
    useEffect(() => {
        // Call handleScroll after the component mounts
        const contentWrapper = document.querySelector('.spirit-guide large');
        const contentHeader = document.querySelector('.contentHeader');
        const bodyContent = document.querySelector('.bodyContent');
        const scrollIndicator = document.querySelector('.scroll-indicator');
        handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator);

        // Set up the scroll event listener
        window.addEventListener('scroll', handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator));

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator));
        };
    }, []);
    return (
        <div className="content-wrapper">
            <div className="spirit-guide large">
                <div className="content">
                    <h1 className="contentHeader">Want to create your own Path?</h1>
                    <div className="bodyContent">
                        <p>This is where you will be able to create a path of challenges for you and your friends to travel </p>
                    </div>
                    <div className="scroll-indicator">
                        <FontAwesomeIcon icon={faLongArrowUp} className="arrow up" />
                        <FontAwesomeIcon icon={faArrowsV} className="arrow updown" />
                        <FontAwesomeIcon icon={faLongArrowDown} className="arrow down" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Create;