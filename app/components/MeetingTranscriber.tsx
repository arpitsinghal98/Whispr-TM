import { useState, useEffect, useCallback } from "react";
import { db, doc, updateDoc } from "~/utils/firestoreClient";

interface MeetingDetails {
  id: string;
  summary: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  transcript?: string;
  notes?: string;
  status?: string;
  meetLink?: string;
  isOrganizer?: boolean;
  chat?: string[];
}

interface MeetingTranscriberProps {
  meetingDetails: MeetingDetails;
}

export default function MeetingTranscriber({ meetingDetails }: MeetingTranscriberProps) {
  const [meetingStarted, setMeetingStarted] = useState(false);
  const transcript = meetingDetails.transcript || "";
  const summary = meetingDetails.summary || "";
  const [chat, setChat] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const saveMeetingUpdate = useCallback(async (updates: Partial<MeetingDetails>) => {
    try {
      setIsSaving(true);
      const meetingRef = doc(db, "meetings", meetingDetails.id);
      await updateDoc(meetingRef, updates);
    } catch (error) {
      console.error("Error saving meeting update:", error);
    } finally {
      setIsSaving(false);
    }
  }, [meetingDetails.id]);

  const handleStart = async () => {
    setMeetingStarted(true);
    await saveMeetingUpdate({ status: "in_progress" });
  };

  const handleJoinMeet = () => {
    if (meetingDetails.meetLink) {
      window.open(meetingDetails.meetLink, '_blank');
    }
  };

  const handleAsk = async () => {
    if (question.trim()) {
      const newChat = [...chat, `Q: ${question}`, "A: (AI answer placeholder)"];
      setChat(newChat);
      setQuestion("");
      
      // Save chat history to Firestore
      await saveMeetingUpdate({ chat: newChat });
    }
  };

  // Update transcript in Firestore when it changes
  useEffect(() => {
    if (transcript !== meetingDetails.transcript) {
      saveMeetingUpdate({ transcript });
    }
  }, [transcript, meetingDetails.transcript, saveMeetingUpdate]);

  // Update summary in Firestore when it changes
  useEffect(() => {
    if (summary !== meetingDetails.summary) {
      saveMeetingUpdate({ summary });
    }
  }, [summary, meetingDetails.summary, saveMeetingUpdate]);

  // If meeting is already in progress, show the meeting interface
  useEffect(() => {
    if (meetingDetails.status === "in_progress") {
      setMeetingStarted(true);
    }
  }, [meetingDetails.status]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {!meetingStarted ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#4B3576] mb-4">
            {meetingDetails.isOrganizer ? "Ready to start your meeting?" : "Meeting Details"}
          </h2>
          <p className="text-gray-600 mb-6">
            {meetingDetails.description || "No description available"}
          </p>
          {meetingDetails.isOrganizer ? (
            <button
              className="bg-[#4B3576] text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-[#3a285c] transition"
              onClick={handleStart}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleStart();
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? "Starting..." : "Start Meeting"}
            </button>
          ) : (
            <button
              className="bg-[#4B3576] text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-[#3a285c] transition"
              onClick={handleJoinMeet}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleJoinMeet();
                }
              }}
              disabled={!meetingDetails.meetLink}
            >
              Join Google Meet
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="font-bold text-xl mb-2">Transcript</h2>
            <div className="bg-gray-100 rounded p-3 text-gray-700 whitespace-pre-line min-h-[80px]">
              {transcript || "Transcript will appear here in real time..."}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="font-bold text-xl mb-2">Summary</h2>
            <div className="bg-gray-50 rounded p-3 text-gray-700 min-h-[40px]">
              {summary || "Summary will be generated after the meeting..."}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="font-bold text-xl mb-2">Chat & Review</h2>
            <div className="space-y-2 mb-2">
              {chat.map((msg, i) => (
                <div key={i} className="bg-gray-100 rounded p-2 text-sm">{msg}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Ask a follow-up question..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                disabled={isSaving}
              />
              <button
                className="bg-[#4B3576] text-white px-4 py-2 rounded"
                onClick={handleAsk}
                disabled={isSaving || !question.trim()}
              >
                {isSaving ? "..." : "Ask"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 