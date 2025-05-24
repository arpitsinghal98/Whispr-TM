import { Timestamp } from 'firebase/firestore';

// User Schema
export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  googleAccessToken?: string;
}

// Meeting Schema

export interface Meeting {
  id: string;
  userId: string;
  calendarEventId: string;
  transcriptId: string;
  summaryId: string;
  chatId: string;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  meetLink?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Transcript Schema
export interface TranscriptSegment {
  text: string;
  timestamp: Timestamp;
}

export interface Transcript {
  id: string;
  meetingId: string;
  transcript: TranscriptSegment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Chat Schema
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Timestamp;
}

export interface Chat {
  id: string;
  meetingId: string;
  messages: ChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Summary Schema
export interface Summary {
  id: string;
  meetingId: string;
  content: {
    mainSummary: string;
    actionItems: string[];
    keyInsights: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  MEETINGS: 'meetings',
  TRANSCRIPTS: 'transcripts',
  CHATS: 'chats',
  SUMMARIES: 'summaries',
} as const;

// Helper function to create a new document with timestamps
export function createDocument<T extends { createdAt?: Timestamp; updatedAt?: Timestamp }>(
  data: Omit<T, 'createdAt' | 'updatedAt'>
): T {
  const now = Timestamp.now();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  } as T;
}

// Helper function to update a document with updatedAt timestamp
export function updateDocument<T extends { updatedAt?: Timestamp }>(
  data: Partial<Omit<T, 'updatedAt'>>
): Partial<T> {
  return {
    ...data,
    updatedAt: Timestamp.now(),
  } as Partial<T>;
} 