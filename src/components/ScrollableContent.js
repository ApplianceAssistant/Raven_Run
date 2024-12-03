import React, { useRef, useEffect, useState } from 'react';

const ScrollableContent = ({ children, maxHeight, bottomPadding = '50px', dependencies = [] }) => {
  const contentRef = useRef(null);
  const [scrollState, setScrollState] = useState('none');

  const checkScrollState = () => {
    const content = contentRef.current;
    if (content) {
      const { scrollTop, scrollHeight, clientHeight } = content;
      
      if (scrollHeight <= clientHeight) {
        setScrollState('none');
      } else if (scrollTop === 0) {
        setScrollState('down');
      } else if (scrollTop + clientHeight >= scrollHeight) {
        setScrollState('up');
      } else {
        setScrollState('both');
      }
    }
  };

  useEffect(() => {
    const content = contentRef.current;

    if (content) {
      content.addEventListener('scroll', checkScrollState);
      // Initial check
      checkScrollState();
      // Re-check after a short delay to account for dynamic content
      setTimeout(checkScrollState, 100);
    }

    return () => {
      if (content) {
        content.removeEventListener('scroll', checkScrollState);
      }
    };
  }, []);

  // Add new useEffect to recheck scroll state when dependencies change
  useEffect(() => {
    checkScrollState();
    // Re-check after a short delay to account for dynamic content
    setTimeout(checkScrollState, 100);
  }, dependencies);

  return (
    <div className="scrollable-content">
      <div 
        ref={contentRef} 
        className="bodyContent" 
        style={{ maxHeight, paddingBottom: bottomPadding }}
      >
        {children}
      </div>
      {scrollState !== 'none' && (
        <div className={`scroll-indicator ${scrollState}`}>
          {scrollState !== 'down' && <div className="arrow up">▲</div>}
          {scrollState === 'both' && <div className="arrow updown">↕</div>}
          {scrollState !== 'up' && <div className="arrow down">▼</div>}
        </div>
      )}
    </div>
  );
};

export default ScrollableContent;