import React from 'react';
import ScrollableContent from './ScrollableContent';

function Contact() {
  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Have a Question?</h1>
          <ScrollableContent maxHeight="60vh">
            <p>Don't we all.</p>
          </ScrollableContent>
        </div>
      </div>
    </div>
  );
}

export default Contact;