import { TranscriptionSegment, RealtimeSummary } from '../types';

const SUMMARY_WINDOW_MINUTES = 3;

export const generateRealtimeSummary = (segments: TranscriptionSegment[]): RealtimeSummary => {
  // Get segments from last 3 minutes
  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - SUMMARY_WINDOW_MINUTES);
  
  const recentSegments = segments.filter(segment => {
    const segmentTime = new Date();
    const [hours, minutes, seconds] = segment.timestamp.split(':').map(Number);
    segmentTime.setHours(hours, minutes, seconds);
    return segmentTime > cutoffTime;
  });

  const combinedText = recentSegments.map(s => s.text).join(' ');

  return {
    keyPoints: extractKeyPoints(combinedText),
    actionItems: extractActionItems(combinedText),
    deadlines: extractDeadlines(combinedText),
    timestamp: new Date().toLocaleTimeString()
  };
};

const extractKeyPoints = (text: string): string[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keyPoints = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return (
      lower.includes('important') ||
      lower.includes('key') ||
      lower.includes('main') ||
      lower.includes('critical') ||
      lower.includes('essential')
    );
  });
  
  return keyPoints.slice(0, 3).map(point => point.trim());
};

const extractActionItems = (text: string): string[] => {
  const actionPatterns = [
    /(?:need to|should|must|will|going to) ([^.!?]+)/gi,
    /(?:action item|task|todo):? ([^.!?]+)/gi,
    /(?:assigned to|responsible for) ([^.!?]+)/gi
  ];

  const actionItems = new Set<string>();
  
  actionPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        actionItems.add(match[1].trim());
      }
    }
  });

  return Array.from(actionItems).slice(0, 4);
};

const extractDeadlines = (text: string): string[] => {
  const deadlinePatterns = [
    /by (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^.!?]*/gi,
    /due (?:on|by) [^.!?]*/gi,
    /deadline:? [^.!?]*/gi,
    /(?:january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2}(?:st|nd|rd|th)?(?:,? \d{4})?/gi
  ];

  const deadlines = new Set<string>();
  
  deadlinePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      deadlines.add(match[0].trim());
    }
  });

  return Array.from(deadlines).slice(0, 3);
};