import React, { useRef, useEffect, useState } from 'react';

const ScrollableContent = ({ children, maxHeight = 'calc(var(--content-vh, 1vh) * 80)', className = '', style = {} }) => {
  const contentRef = useRef(null);
  const bodyRef = useRef(null);
  const [scrollState, setScrollState] = useState('none');
  const resizeObserverRef = useRef(null);

  const checkScrollState = () => {
    const content = bodyRef.current;
    if (!content) {
      console.log('ScrollableContent: bodyRef not found');
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = content;
    const isScrollable = scrollHeight > clientHeight;

    console.log('ScrollableContent Debug:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      isScrollable,
      currentState: scrollState
    });

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
      console.log('ScrollableContent: State changing from', scrollState, 'to', newState);
      setScrollState(newState);
    }
  };

  useEffect(() => {
    const content = bodyRef.current;
    if (!content) return;

    console.log('ScrollableContent: Setting up listeners and observer');

    // Setup ResizeObserver
    resizeObserverRef.current = new ResizeObserver(() => {
      console.log('ScrollableContent: Resize detected');
      checkScrollState();
    });
    resizeObserverRef.current.observe(content);

    content.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    // Initial check after a short delay to ensure content is rendered
    setTimeout(() => {
      console.log('ScrollableContent: Initial check after delay');
      checkScrollState();
    }, 100);

    return () => {
      console.log('ScrollableContent: Cleaning up listeners');
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

  console.log('ScrollableContent: Rendering with scroll state:', scrollState);

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