import React, { useEffect } from 'react';
import { useMessage } from '../utils/MessageProvider';
import '../css/MessageDisplay.scss';

function MessageDisplay() {
  const { message, clearMessage } = useMessage();

  // Only log mounting for debugging
  useEffect(() => {
    console.log('MessageDisplay mounted');
    return () => console.log('MessageDisplay unmounting');
  }, []);

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
