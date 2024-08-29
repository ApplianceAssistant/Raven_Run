import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';

function About() {
  return (
    <div className="content-wrapper">
      <div className="oval-content">
        <div className="content">
          <h1 className="contentHeader">Like to play games?</h1>
          <div className="bodyContent">
            <p>What's more fun than unraveling a mystery with friends?</p>
            <p>Beware, the guides are not to be trusted! They volunteered, but we are unsure of their intentions.
              They are known to be intentionally misleading and enjoy watching those with breath wander around aimlessly</p>
            <p>All the more reason to trust the living by your side to solve each puzzle and find the truth!</p>
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