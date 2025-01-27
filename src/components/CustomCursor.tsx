'use client';

import { useEffect, useState } from 'react';
import styles from './CustomCursor.module.css';

const CustomCursor = () => {
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Mouse movement handler
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    // Click handlers
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Interactive elements hover handlers
    const handleLinkHoverStart = () => setIsHoveringLink(true);
    const handleLinkHoverEnd = () => setIsHoveringLink(false);

    // Add event listeners
    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Add hover detection for interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, [role="button"]'
    );

    interactiveElements.forEach((element) => {
      element.addEventListener('mouseenter', handleLinkHoverStart);
      element.addEventListener('mouseleave', handleLinkHoverEnd);
    });

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      interactiveElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleLinkHoverStart);
        element.removeEventListener('mouseleave', handleLinkHoverEnd);
      });

      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      <div
        className={`${styles.cursorOuter} ${isClicking ? styles.clicking : ''} ${
          isHoveringLink ? styles.hovering : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        className={`${styles.cursorInner} ${isClicking ? styles.clicking : ''} ${
          isHoveringLink ? styles.hovering : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
};

export default CustomCursor;