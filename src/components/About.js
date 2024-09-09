import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';
import { handleScroll } from '../utils/utils';

function About() {
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
          <h1 className="contentHeader">Like to play games?</h1>
          <ScrollableContent>
            <div className="bodyContent">
              <h3>Project in progress!
              Check back soon for updates.</h3>
            <p>What's more fun than unraveling a mystery with friends?</p>
            <p>Beware, the guides are not to be trusted! They volunteered, but we are unsure of their origin or intentions.
              They are known to be intentionally misleading and often speak half-truths or outright lies.</p>
            <p>All the more reason to trust the friends by your side to solve each puzzle and discover the truth!</p>
        </div>
      </ScrollableContent>
    </div>
      </div >
    </div >
  );
}

export default About;