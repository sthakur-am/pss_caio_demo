import { TranscriptionSegment, Summary } from '../types';

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const wrapAndLimitText = (text: string): string => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine: string[] = [];

  words.forEach((word) => {
    currentLine.push(word);
    if (currentLine.length === 6) {
      lines.push(currentLine.join(' '));
      currentLine = [];
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  return lines.join('\n');
};

export const removeDuplicates = (segments: TranscriptionSegment[]): TranscriptionSegment[] => {
  const uniqueTexts = new Set<string>();
  return segments.filter(segment => {
    const normalized = segment.text.toLowerCase().trim();
    if (uniqueTexts.has(normalized)) {
      return false;
    }
    uniqueTexts.add(normalized);
    return true;
  });
};

interface SummaryOptions {
  startTime: string;
  endTime: string;
  participants: string[];
}

export const generateSummary = (
  segments: TranscriptionSegment[],
  options: SummaryOptions
): Summary => {
  const uniqueSegments = removeDuplicates(segments);
  const fullText = uniqueSegments.map(s => s.text).join(' ');
  
  return {
    topics: extractTopics(fullText),
    decisions: extractDecisions(fullText),
    nextSteps: extractNextSteps(fullText),
    dates: extractDates(fullText),
    startTime: options.startTime,
    endTime: options.endTime,
    participants: options.participants
  };
};

const extractTopics = (text: string): string[] => {
  const sentences = text.split(/[.!?]+/);
  return sentences
    .filter(s => s.length > 20)
    .slice(0, 5)
    .map(s => s.trim());
};

const extractDecisions = (text: string): string[] => {
  const decisions = text.match(/(?:decided|agreed|concluded|determined) (?:to|that) [^.!?]+[.!?]/gi) || [];
  return decisions.map(d => d.trim());
};

const extractNextSteps = (text: string): string[] => {
  const nextSteps = text.match(/(?:need to|should|will|must) [^.!?]+[.!?]/gi) || [];
  return nextSteps.map(s => s.trim());
};

const extractDates = (text: string): string[] => {
  const dateRegex = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}\b/gi;
  return (text.match(dateRegex) || []).map(d => d.trim());
};