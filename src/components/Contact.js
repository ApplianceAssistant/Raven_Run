import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';

function Contact() {
  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Have a Question?</h1>
          <ScrollableContent maxHeight="400px">
            <p>Don't we all.</p>
          </ScrollableContent>
        </div>
      </div>
    </div>
  );
}

export default Contact;