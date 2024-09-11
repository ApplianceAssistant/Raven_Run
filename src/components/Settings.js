import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';
import { handleScroll } from '../utils/utils';

function Settings() {
  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Your Settings</h1>
          <ScrollableContent>
            <p>This is where you can update your settings and preferences</p>
          </ScrollableContent>
        </div>
      </div>
    </div>
  );
}

export default Settings;