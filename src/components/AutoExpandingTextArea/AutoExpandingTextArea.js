import React, { useRef, useEffect, useState } from 'react';
import './AutoExpandingTextArea.scss';

const AutoExpandingTextArea = ({ 
  value, 
  onChange, 
  placeholder, 
  name, 
  id, 
  required,
  maxHeight = '40vh', // Maximum height as percentage of viewport height
  minHeight = '60px',  // Minimum height in pixels
  onHeightChange // Callback for height changes
}) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(minHeight);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the new height
    const maxHeightPx = window.innerHeight * (parseInt(maxHeight) / 100);
    const newHeight = isFocused
      ? Math.min(textarea.scrollHeight, maxHeightPx)
      : Math.min(parseInt(minHeight) * 2, textarea.scrollHeight, maxHeightPx);

    // Set the height, ensuring it's not less than minHeight
    const finalHeight = Math.max(parseInt(minHeight), newHeight);
    textarea.style.height = `${finalHeight}px`;

    // Notify parent of height change if callback provided
    if (onHeightChange && finalHeight !== currentHeight) {
      setCurrentHeight(finalHeight);
      onHeightChange(finalHeight);
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      name={name}
      id={id}
      required={required}
      className={`auto-expanding-textarea ${isFocused ? 'focused' : ''}`}
      style={{
        minHeight,
        maxHeight: `calc(var(--safe-vh, 1vh) * ${parseInt(maxHeight)})`,
        transition: 'height 0.2s ease-out'
      }}
    />
  );
};

export default AutoExpandingTextArea;
