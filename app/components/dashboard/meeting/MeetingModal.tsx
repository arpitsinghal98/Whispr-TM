import { useState } from "react";
import type { CalendarEvent } from "~/types/meeting";
import { useMeetingData } from "~/hooks/useMeetingData";
import MeetingSummary from "./MeetingSummary";
import MeetingTranscript from "./MeetingTranscript";
import MeetingChat from "./MeetingChat";
import MeetingNotes from "./MeetingNotes";
import ErrorBoundary from "~/components/ErrorBoundary";

interface MeetingModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  userId: string;
}

export default function MeetingModal({ open, onClose, event, userId }: MeetingModalProps) {
  const [tab, setTab] = useState("summary");
  const {
    transcript,
    chatHistory,
    summary,
    actionItems,
    insights,
    error,
    updateChatHistory,
  } = useMeetingData(event?.id || "", userId);

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F9F6F2] rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-[#4B3576]">{event.summary}</h2>
            <p className="text-gray-600 mt-1">
              {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : ''}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-[#4B3576] transition-all duration-200 p-2 hover:bg-[#4B3576]/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4B3576]/20"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-6 pb-0">
            <div className="flex space-x-2 mb-6 bg-gray-50 p-1 rounded-xl">
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === "summary" 
                    ? "bg-[#4B3576] text-white shadow-sm" 
                    : "text-gray-600 hover:text-[#4B3576] hover:bg-[#4B3576]/10"
                }`}
                onClick={() => setTab("summary")}
              >
                Summary
              </button>
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === "transcript" 
                    ? "bg-[#4B3576] text-white shadow-sm" 
                    : "text-gray-600 hover:text-[#4B3576] hover:bg-[#4B3576]/10"
                }`}
                onClick={() => setTab("transcript")}
              >
                Transcript
              </button>
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === "chat" 
                    ? "bg-[#4B3576] text-white shadow-sm" 
                    : "text-gray-600 hover:text-[#4B3576] hover:bg-[#4B3576]/10"
                }`}
                onClick={() => setTab("chat")}
              >
                Chat
              </button>
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === "notes" 
                    ? "bg-[#4B3576] text-white shadow-sm" 
                    : "text-gray-600 hover:text-[#4B3576] hover:bg-[#4B3576]/10"
                }`}
                onClick={() => setTab("notes")}
              >
                Notes
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0">
            <ErrorBoundary>
              {tab === "summary" && (
                <MeetingSummary
                  summary={summary}
                  actionItems={actionItems}
                  insights={insights}
                />
              )}

              {tab === "transcript" && (
                <MeetingTranscript transcript={transcript} eventId={event.id} />
              )}

              {tab === "chat" && (
                <div className="h-full">
                  <MeetingChat
                    eventId={event.id}
                    transcript={transcript}
                    chatHistory={chatHistory}
                    onChatUpdate={updateChatHistory}
                    className="h-full"
                  />
                </div>
              )}

              {tab === "notes" && (
                <div className="h-full">
                  <MeetingNotes
                    meetingId={event.id}
                    userId={userId}
                  />
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
} 