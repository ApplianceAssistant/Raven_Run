import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';
import { handleScroll } from '../utils/utils';

function About() {
  return (

    <>
      <h1 className="contentHeader">Like to play games?</h1>
      <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 70)">
        <h3>Crow Tours is currently in alpha testing.</h3>
        <p>We're excited to have you join our flock of early explorers! Your feedback is invaluable in helping us refine and improve the game.
          Please note that you may encounter unexpected behaviors or changes as we continue to develop. We appreciate your patience and input during this phase.
          Have thoughts to share?</p>
        <a
          href="https://www.facebook.com/CrowTours/"
          target="_blank"
          description="Crow Tours Facebook Page"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Visit our Facebook Page to let us know about your experience.
        </a>
        <p>Together, we'll make Crow Tours soar!</p>
        <p>What's more fun than unraveling a mystery with friends?</p>
        <p>Beware, the guides are not to be trusted! They volunteered, but we are unsure of their origin or intentions.
          They are known to be misleading and often speak half-truths or outright lies.</p>
        <p>All the more reason to trust the friends by your side to solve each puzzle and discover the truth!</p>
      </ScrollableContent>
    </>
  );
}

export default About;