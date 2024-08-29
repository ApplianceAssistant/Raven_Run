import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';

function Contact() {
  return (
    <div className="content-wrapper">
      <div className="oval-content">
        <div className="content">
          <h1 className="contentHeader">Have a Question?</h1>
          <div className="bodyContent">
            <p>Feel free to reach out to us with any inquiries.</p>
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