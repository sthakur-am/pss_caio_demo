import { TranscriptionSegment, Summary } from '../types';

export interface ProcessedFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadDate: string;
}

export interface TranscriptionSegment {
  text: string;
  timestamp: string;
  speaker: Speaker;
  id: string;
}

export interface RealtimeSummary {
  keyPoints: string[];
  actionItems: string[];
  deadlines: string[];
  timestamp: string;
}

export interface Summary {
  topics: string[];
  decisions: string[];
  nextSteps: string[];
  dates: string[];
  startTime: string;
  endTime: string;
  participants: Speaker[];
}

export type TranscriptionStatus = 'idle' | 'recording' | 'stopped' | 'error';

export type Speaker = 'A' | 'B' | 'C' | 'D';

export interface OpenAIConfig {
  apiKey: string;
  prompt: string;
  contextFiles?: ProcessedFile[];
}

export interface OpenAIResponse {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: string | null;
  error: string | null;
}

export type QuestionType = 'multiple_choice' | 'short_answer' | 'rating_scale';

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  questionId: string;
  answer: string;
  timestamp: string;
  sessionId: string;
}

export interface SurveyConfig {
  questions: SurveyQuestion[];
  openaiPrompt: string;
  qrCodeSize: number;
  qrCodeColor: string;
  qrCodeLogo?: string;
}

export interface SiteConfig {
  id: string;
  name: string;
  slug: string;
  clientName: string;
  clientLogo: string;
  companyLogo: string;
  companyName: string;
  created_at: string;
  openaiApiKey?: string;
  backgroundColor?: string;
  titleColor?: string;
  transcriptColor?: string;
  transcriptFontSize?: string;
  wordCloudBackgroundColor?: string;
  wordCloudTextColor?: string;
  wordCloudPosition?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  wordCloudSize?: {
    width: number;
    height: number;
  };
  shortenedUrl?: string;
  navBarColor?: string;
  surveyConfig?: SurveyConfig;
  qrCodeUrl?: string;
  contextFiles?: ProcessedFile[];
}

export interface SiteConfigFormData extends Omit<SiteConfig, 'id' | 'created_at'> {
  surveyConfig?: SurveyConfig;
  qrCodeUrl?: string;
  contextFiles?: ProcessedFile[];
}

export interface SurveyAnalysis {
  summary: string;
  participantCount: number;
  questionAnalysis: {
    questionId: string;
    questionText: string;
    responses: {
      answer: string;
      count: number;
    }[];
    insights: string;
  }[];
  trends: string[];
  recommendations: string[];
}