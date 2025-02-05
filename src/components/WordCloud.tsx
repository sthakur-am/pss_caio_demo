import React, { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';

interface Word {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
}

interface WordCloudProps {
  text: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
}

// Basic rules to identify likely nouns
const isLikelyNoun = (word: string): boolean => {
  // Common word endings that often indicate nouns
  const nounEndings = ['tion', 'ment', 'ness', 'ity', 'ing', 'er', 'or', 'ism'];
  const lowercaseWord = word.toLowerCase();
  
  // Common non-nouns to exclude
  const nonNouns = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which',
    'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
    'him', 'know', 'take', 'into', 'year', 'your', 'good', 'some',
    'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
    'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after',
    'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
    'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'was', 'were', 'been', 'being', 'am', 'are', 'is', 'very', 'really',
    'should', 'would', 'could', 'might', 'must', 'shall'
  ]);

  // Return false for common non-nouns
  if (nonNouns.has(lowercaseWord)) {
    return false;
  }

  // Check if word starts with a capital letter (proper noun)
  if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
    return true;
  }

  // Check for noun endings
  return nounEndings.some(ending => lowercaseWord.endsWith(ending));
}

export const WordCloud: React.FC<WordCloudProps> = ({ 
  text, 
  width = 400, 
  height = 300,
  backgroundColor = 'rgba(0, 0, 0, 0.2)',
  textColor = '#FFFFFF'
}) => {
  const [words, setWords] = useState<Word[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processText = (text: string) => {
      // Split text into words and clean them
      const words = text.split(/\s+/)
        .map(word => word.replace(/[^\w\s]/g, ''))
        .filter(word => word.length > 2);

      // Count word frequencies (only for likely nouns)
      const frequency: { [key: string]: number } = {};
      words.forEach(word => {
        if (isLikelyNoun(word)) {
          frequency[word] = (frequency[word] || 0) + 1;
        }
      });

      // Convert to array of Word objects
      return Object.entries(frequency)
        .map(([text, count]) => ({
          text,
          size: Math.max(12, Math.min(60, count * 8))
        }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 50); // Limit to top 50 nouns
    };

    const layout = cloud()
      .size([width, height])
      .padding(5)
      .rotate(() => 0)
      .font('Inter')
      .fontSize(d => (d as Word).size)
      .words(processText(text))
      .on('end', (words: Word[]) => {
        setWords(words);
      });

    layout.start();
  }, [text, width, height]);

  return (
    <div 
      ref={containerRef}
      className="rounded-lg p-4"
      style={{ backgroundColor }}
    >
      <svg width={width} height={height}>
        <g transform={`translate(${width / 2},${height / 2})`}>
          {words.map((word, i) => (
            <text
              key={i}
              style={{
                fontSize: `${word.size}px`,
                fontFamily: 'Inter',
                fill: textColor,
                cursor: 'default',
                userSelect: 'none'
              }}
              textAnchor="middle"
              transform={`translate(${word.x || 0},${word.y || 0})`}
              className="transition-all duration-300 ease-in-out hover:fill-blue-400"
            >
              {word.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};