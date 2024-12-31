import React, { useRef, useEffect, useState } from 'react';
import './AutoExpandingTextArea.scss';

const AutoExpandingTextArea = ({ 
  value, 
  onChange, 
  placeholder, 
  name, 
  id, 
  required,
  maxHeight = '50vh', // Maximum height as percentage of viewport height
  minHeight = '60px'  // Minimum height in pixels
}) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the new height
    const newHeight = Math.min(
      textarea.scrollHeight,
      window.innerHeight * (parseInt(maxHeight) / 100)
    );

    // Set the height, ensuring it's not less than minHeight
    textarea.style.height = `${Math.max(parseInt(minHeight), newHeight)}px`;
  };

  // Adjust height when value changes
  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    adjustHeight();
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
        maxHeight
      }}
    />
  );
};

export default AutoExpandingTextArea;
