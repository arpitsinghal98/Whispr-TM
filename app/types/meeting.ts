export interface CalendarEvent {
  id: string;
  summary: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  attendees?: Array<{
    email: string;
    responseStatus?: string;
  }>;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
    }>;
  };
  creator?: {
    email: string;
  };
}

export interface MeetingData {
  id: string;
  userId: string;
  status: 'invited' | 'active' | 'completed';
  createdAt: string;
  transcript: Array<{
    text: string;
    timestamp: string;
  }>;
  notes: string;
  summary: string;
  actionItems: string[];
  insights?: {
    sentiment: string;
    keyTopics: string[];
    decisions: string[];
  };
  chat?: Array<{
    q: string;
    a: string;
  }>;
}

export interface MeetingInsights {
  sentiment: string;
  keyTopics: string[];
  decisions: string[];
} 