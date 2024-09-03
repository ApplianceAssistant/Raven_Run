import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';
import { handleScroll } from '../utils/utils';

function About() {
  useEffect(() => {
    // Call handleScroll after the component mounts
    handleScroll();

    // Set up the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <div className="content-wrapper">
      <div className="spirit-guide-large">
        <div className="content">
          <h1 className="contentHeader">Like to play games?</h1>
          <div className="bodyContent">
            <p>What's more fun than unraveling a mystery with friends?</p>
            <p>Beware, the guides are not to be trusted! They volunteered, but we are unsure of their origin or intentions.
              They are known to be intentionally misleading and often speak half-truths or outright lies.</p>
            <p>All the more reason to trust the friends by your side to solve each puzzle and discover the truth!</p>
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

export default About;