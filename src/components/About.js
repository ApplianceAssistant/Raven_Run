import React from 'react';
import { Link } from 'react-router-dom';
import ScrollableContent from './ScrollableContent';
import { handleScroll } from '../utils/utils';

function About() {
  return (
    <div className="text-content-page">
      <h1>Like to play games?</h1>
      <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 80)">
        <h2>Crow Tours Alpha Testing</h2>
        <p>We're excited to have you join our flock of early explorers! Your feedback is invaluable in helping us refine and improve the game.
          Please note that you may encounter unexpected behaviors or changes as we continue to develop. We appreciate your patience and input during this phase.</p>
        
        <h3>Share Your Experience</h3>
        <p>Have thoughts to share?</p>
        <a
          href="https://www.facebook.com/CrowTours/"
          target="_blank"
          description="Crow Tours Facebook Page"
          rel="noopener noreferrer"
        >
          Visit our Facebook Page to let us know about your experience.
        </a>
        
        <h3>Game Overview</h3>
        <p>Together, we'll make Crow Tours soar!</p>
        <p>What's more fun than unraveling a mystery with friends?</p>
        <p>Beware, the guides are not to be trusted! They volunteered, but we are unsure of their origin or intentions.
          They are known to be misleading and often speak half-truths or outright lies.</p>
        <p>All the more reason to trust the friends by your side to solve each puzzle and discover the truth!</p>
        
        <div className="legal-links">
          <h3>Legal Information</h3>
          <ul>
            <li>
              <Link to="/privacy">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </ScrollableContent>
    </div>
  );
}

export default About;