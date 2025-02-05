import React, { useEffect, useRef, useState } from 'react';

interface AutoResizingTextProps {
  text: string;
}

export const AutoResizingText: React.FC<AutoResizingTextProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const resizeText = () => {
      if (!containerRef.current || !textRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      let currentSize = 100;
      textRef.current.style.fontSize = `${currentSize}px`;

      let min = 1;
      let max = 200;

      while (min <= max) {
        currentSize = Math.floor((min + max) / 2);
        textRef.current.style.fontSize = `${currentSize}px`;

        if (
          textRef.current.scrollHeight <= containerHeight * 0.9 &&
          textRef.current.scrollWidth <= containerWidth * 0.9
        ) {
          min = currentSize + 1;
        } else {
          max = currentSize - 1;
        }
      }

      setFontSize(max);
    };

    resizeText();

    const observer = new ResizeObserver(resizeText);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [text]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen flex items-center justify-center p-8"
    >
      <div 
        ref={textRef}
        style={{ fontSize: `${fontSize}px` }}
        className="text-center font-medium leading-tight whitespace-pre-line"
      >
        {text || 'Waiting...'}
      </div>
    </div>
  );
};