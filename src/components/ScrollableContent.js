import React, { useRef, useEffect, useState } from 'react';

const ScrollableContent = ({ children, maxHeight = 'calc(var(--content-vh, 1vh) * 80)', className = '', style = {} }) => {
  const contentRef = useRef(null);
  const bodyRef = useRef(null);
  const [scrollState, setScrollState] = useState('none');
  const resizeObserverRef = useRef(null);

  const checkScrollState = () => {
    const content = bodyRef.current;
    if (!content) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = content;
    const isScrollable = scrollHeight > clientHeight;

    let newState = 'none';
    if (!isScrollable) {
      newState = 'none';
    } else if (scrollTop === 0) {
      newState = 'down';
    } else if (scrollTop + clientHeight >= scrollHeight - 1) {
      newState = 'up';
    } else {
      newState = 'both';
    }

    if (newState !== scrollState) {
      setScrollState(newState);
    }
  };

  useEffect(() => {
    const content = bodyRef.current;
    if (!content) return;


    // Setup ResizeObserver
    resizeObserverRef.current = new ResizeObserver(() => {
      checkScrollState();
    });
    resizeObserverRef.current.observe(content);

    content.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    // Initial check after a short delay to ensure content is rendered
    setTimeout(() => {
      checkScrollState();
    }, 100);

    return () => {
      content.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Let the CSS handle most of the styling
  const containerStyle = {
    ...style,
    ...(maxHeight ? { maxHeight } : {})
  };

  return (
    <div 
      ref={contentRef}
      className={`scrollable-content ${className}`}
      style={containerStyle}
    >
      <div 
        ref={bodyRef}
        className="bodyContent"
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