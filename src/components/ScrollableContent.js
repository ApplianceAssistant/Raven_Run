import React, { useRef, useEffect, useState } from 'react';

const ScrollableContent = ({ children, maxHeight, bottomPadding = '30px', dependencies = [], className = '', style = {} }) => {
  const contentRef = useRef(null);
  const [scrollState, setScrollState] = useState('none');

  const checkScrollState = () => {
    const element = contentRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) {
      setScrollState('none');
    } else if (scrollTop === 0) {
      setScrollState('down');
    } else if (scrollTop + clientHeight >= scrollHeight) {
      setScrollState('up');
    } else {
      setScrollState('both');
    }
  };

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    element.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    return () => {
      element.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, []);

  useEffect(() => {
    setTimeout(checkScrollState, 100);
  }, dependencies);

  // Convert vh values to use the custom property
  const adjustedStyle = { ...style };
  if (maxHeight && maxHeight.includes('vh')) {
    const value = parseFloat(maxHeight);
    adjustedStyle.maxHeight = `calc(var(--vh, 1vh) * ${value})`;
  } else {
    adjustedStyle.maxHeight = maxHeight;
  }

  return (
    <div className={`scrollable-content ${className}`}>
      <div 
        ref={contentRef} 
        className="bodyContent" 
        style={{ ...adjustedStyle, paddingBottom: bottomPadding }}
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