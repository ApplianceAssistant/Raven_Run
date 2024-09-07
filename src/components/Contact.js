import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';

function Contact() {
  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Have a Question?</h1>
          <div className="bodyContent">
            <p>Don't we all.</p>
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

export default Contact;