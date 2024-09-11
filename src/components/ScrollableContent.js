import React, { useRef, useEffect } from 'react';
import { handleScroll } from '../utils/utils'; // Adjust the import path as needed

const ScrollableContent = ({ children, maxHeight, bottomPadding = '50px' }) => {
  const contentRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    const scrollIndicator = scrollIndicatorRef.current;

    const handleScrollEvent = () => handleScroll(null, null, content, scrollIndicator);

    if (content) {
      content.addEventListener('scroll', handleScrollEvent);
      handleScrollEvent();
      setTimeout(handleScrollEvent, 100);
    }

    return () => {
      if (content) {
        content.removeEventListener('scroll', handleScrollEvent);
      }
    };
  }, []);

  return (
    <div className="scrollable-content">
      <div 
        ref={contentRef} 
        className="bodyContent" 
        style={{ maxHeight, paddingBottom: bottomPadding }}
      >
        {children}
      </div>
      <div ref={scrollIndicatorRef} className="scroll-indicator">
        <div className="arrow up">▲</div>
        <div className="arrow updown">↕</div>
        <div className="arrow down">▼</div>
      </div>
    </div>
  );
};

export default ScrollableContent;