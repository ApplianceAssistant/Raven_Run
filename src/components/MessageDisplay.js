import React, { useEffect } from 'react';
import { useMessage } from '../utils/MessageProvider';
import '../css/MessageDisplay.scss';

function MessageDisplay() {
  const { message, clearMessage } = useMessage();
  const messageClass = message ? `message-container ${message.type}` : 'message-container hidden';
  
  return (
    <div className={messageClass}>
      <div className="message-content">
        {message?.text}
      </div>
    </div>
  );
}

export default MessageDisplay;
