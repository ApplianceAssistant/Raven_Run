import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';
import { handleScroll } from '../utils/utils';

function About() {
  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Like to play games?</h1>
          <ScrollableContent maxHeight="60vh">
            <h3>Project in progress!
              Check back soon for updates.</h3>
            <p>What's more fun than unraveling a mystery with friends?</p>
            <p>Beware, the guides are not to be trusted! They volunteered, but we are unsure of their origin or intentions.
              They are known to be intentionally misleading and often speak half-truths or outright lies.</p>
            <p>All the more reason to trust the friends by your side to solve each puzzle and discover the truth!</p>
          </ScrollableContent>
        </div>
      </div >
    </div >
  );
}

export default About;