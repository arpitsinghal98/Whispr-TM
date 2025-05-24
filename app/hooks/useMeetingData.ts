import { useState, useEffect } from "react";
import type { MeetingInsights } from "~/types/meeting";
import { fetchMeetingDetails, updateMeetingData } from "~/utils/api/meetings";
import { generateMeetingSummary, extractActionItems, generateMeetingInsights } from "~/utils/ai";
import { isAppError } from "~/utils/errors";

interface UseMeetingDataReturn {
  transcript: Array<{ text: string; timestamp: string }>;
  chatHistory: Array<{ q: string; a: string }>;
  summary: string;
  actionItems: string[];
  insights: MeetingInsights | null;
  error: string | null;
  updateChatHistory: (newHistory: Array<{ q: string; a: string }>) => void;
}

export function useMeetingData(eventId: string, userId: string): UseMeetingDataReturn {
  const [transcript, setTranscript] = useState<Array<{ text: string; timestamp: string }>>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [insights, setInsights] = useState<MeetingInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeetingData() {
      if (!eventId) return;

      try {
        setError(null);
        const meetingData = await fetchMeetingDetails(eventId, userId);
        if (meetingData) {
          setTranscript(meetingData.transcript);
          setChatHistory(meetingData.chat || []);
          setSummary(meetingData.summary || "No summary available");
          setActionItems(meetingData.actionItems || []);
          setInsights(meetingData.insights || null);
        }
      } catch (error) {
        console.error('Error loading meeting data:', error);
        if (isAppError(error)) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load meeting data');
        }
      }
    }
    loadMeetingData();
  }, [eventId, userId]);

  useEffect(() => {
    async function generateInsights() {
      if (!transcript.length) return;

      try {
        const newSummary = await generateMeetingSummary(transcript);
        const items = await extractActionItems(transcript);
        const meetingInsights = await generateMeetingInsights(transcript);

        setSummary(newSummary);
        setActionItems(items);
        setInsights(meetingInsights);

        if (eventId) {
          await updateMeetingData(eventId, {
            summary: newSummary,
            actionItems: items,
            insights: meetingInsights,
          });
        }
      } catch (error) {
        console.error('Error generating insights:', error);
        if (isAppError(error)) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to generate meeting insights');
        }
      }
    }

    generateInsights();
  }, [transcript, eventId]);

  const updateChatHistory = (newHistory: Array<{ q: string; a: string }>) => {
    setChatHistory(newHistory);
  };

  return {
    transcript,
    chatHistory,
    summary,
    actionItems,
    insights,
    error,
    updateChatHistory,
  };
} 