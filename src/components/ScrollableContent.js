import React, { useRef, useEffect, useState } from 'react';

const ScrollableContent = ({ children, maxHeight, bottomPadding = '50px' }) => {
  const contentRef = useRef(null);
  const [scrollState, setScrollState] = useState('none');

  useEffect(() => {
    const content = contentRef.current;

    const handleScrollEvent = () => {
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

    if (content) {
      content.addEventListener('scroll', handleScrollEvent);
      // Initial check
      handleScrollEvent();
      // Re-check after a short delay to account for dynamic content
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