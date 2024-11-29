import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const MessageContext = createContext(null);

export const MessageTypes = {
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info'
};

const DEFAULT_TIMEOUT = 3000; // 3 seconds

export function MessageProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const clearMessage = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setMessage(null);
  }, [timeoutId]);

  const showMessage = useCallback((text, type = MessageTypes.INFO, timeout = DEFAULT_TIMEOUT) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    // Set the new message
    setMessage({ text, type });

    // Set up auto-dismiss timeout if timeout > 0
    if (timeout > 0) {
      const id = setTimeout(() => {
        setMessage(null);
        setTimeoutId(null);
      }, timeout);
      setTimeoutId(id);
    }
  }, [timeoutId]);

  const contextValue = {
    message,
    showMessage,
    clearMessage,
    showError: useCallback((text) => showMessage(text, MessageTypes.ERROR), [showMessage]),
    showSuccess: useCallback((text) => showMessage(text, MessageTypes.SUCCESS), [showMessage]),
    showWarning: useCallback((text) => showMessage(text, MessageTypes.WARNING), [showMessage]),
    showInfo: useCallback((text) => showMessage(text, MessageTypes.INFO), [showMessage])
  };

  useEffect(() => {
    console.log('Message state changed:', message);
  }, [message]);

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}
