import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';
import { handleScroll } from '../utils/utils';

const ScrollableContent = ({ children, maxHeight = '60vh', className = '' }) => {
  const contentWrapperRef = useRef(null);
  const contentHeaderRef = useRef(null);
  const bodyContentRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    const contentWrapper = contentWrapperRef.current;
    const contentHeader = contentHeaderRef.current;
    const bodyContent = bodyContentRef.current;
    const scrollIndicator = scrollIndicatorRef.current;

    const handleScrollWrapper = () => {
      handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator);
    };

    if (bodyContent) {
      bodyContent.addEventListener('scroll', handleScrollWrapper);
      handleScrollWrapper(); // Initial check
    }

    return () => {
      if (bodyContent) {
        bodyContent.removeEventListener('scroll', handleScrollWrapper);
      }
    };
  }, []);

  return (
    <div ref={contentWrapperRef} className={`scrollable-content ${className}`}>
      <div 
        ref={bodyContentRef}
        className="bodyContent"
        style={{ maxHeight, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <div ref={scrollIndicatorRef} className="scroll-indicator">
        <FontAwesomeIcon icon={faLongArrowUp} className="arrow up" />
        <FontAwesomeIcon icon={faArrowsV} className="arrow updown" />
        <FontAwesomeIcon icon={faLongArrowDown} className="arrow down" />
      </div>
    </div>
  );
};

export default ScrollableContent;