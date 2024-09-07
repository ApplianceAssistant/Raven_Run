import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';
import { handleScroll } from '../utils/utils';

function Settings() {
  useEffect(() => {
    // Call handleScroll after the component mounts
    const contentWrapper = document.querySelector('.spirit-guide large');
    const contentHeader = document.querySelector('.contentHeader');
    const bodyContent = document.querySelector('.bodyContent');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator);

    // Set up the scroll event listener
    window.addEventListener('scroll', handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator));

    return () => {
      window.removeEventListener('scroll', handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator));
    };
  }, []);
  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Your Settings</h1>
          <div className="bodyContent">
            <p>This is where you can update your settings and preferences</p>
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

export default Settings;