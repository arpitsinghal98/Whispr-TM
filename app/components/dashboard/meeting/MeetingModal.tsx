import { useState, useRef, useCallback, useEffect } from "react";
import type { CalendarEvent } from "~/types/meeting";
import { useMeetingData } from "~/hooks/useMeetingData";
import MeetingSummary from "./MeetingSummary";
import MeetingTranscript from "./MeetingTranscript";
import MeetingNotes from "./MeetingNotes";
import MeetingChat from "./MeetingChat";
import ErrorBoundary from "~/components/ErrorBoundary";
import {
  getSummaryForMeeting,
  getTranscriptForMeeting,
  saveTranscriptToFirestore,
} from "~/utils/api/meetings";
import { generateSummaryWithInsights } from "~/utils/ai";
import { Summary, TranscriptSegment } from "~/types/schema";
import AudioTranscriptionService from "~/utils/audioTranscription";
import { useNavigate } from "@remix-run/react";

interface MeetingModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  userId: string;
  showRecordingButton?: boolean;
}

export default function MeetingModal({
  open,
  onClose,
  event,
  userId,
  showRecordingButton,
}: MeetingModalProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("transcript");
  const [isRecording, setIsRecording] = useState(false);
  const [hasStoppedRecording, setHasStoppedRecording] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [localTranscript, setLocalTranscript] = useState<TranscriptSegment[]>(
    []
  );
  const [summaryData, setSummaryData] = useState<Summary>({} as Summary);
  const [transcriptData, setTranscriptData] = useState<TranscriptSegment[]>([]);
  const transcriptionService = useRef<AudioTranscriptionService | null>(null);

  const {
    transcript,
    chatHistory,
    summary,
    actionItems,
    insights,
    error,
    updateChatHistory,
  } = useMeetingData(event?.id || "", userId);

  const handleTranscriptionUpdate = useCallback(
    async (segments: TranscriptSegment[]) => {
      console.log("🎤 Received transcription update:", segments);
      setLocalTranscript((prev) => [...prev, ...segments]);

      // Save to Firestore in real-time
      if (event?.id) {
        try {
          await saveTranscriptToFirestore(segments, event.id, false);
        } catch (err) {
          console.error("❌ Error saving transcript:", err);
        }
      }
    },
    [event?.id]
  );

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        if (!transcriptionService.current) {
          transcriptionService.current = new AudioTranscriptionService(
            handleTranscriptionUpdate
          );
        }

        await transcriptionService.current.startRecording();
        setIsRecording(true);
        setHasStoppedRecording(false);
      } else {
        transcriptionService.current?.stopRecording();
        setIsRecording(false);
        setHasStoppedRecording(true);
        setTab("summary");
        setIsGeneratingSummary(true);

        if (localTranscript.length && event?.id) {
          console.log("💾 Saving final transcript to Firestore...");
          await saveTranscriptToFirestore(localTranscript, event.id, true);
          console.log("✅ Final transcript saved");

          // Switch to summary tab and show loading state
          setIsGeneratingSummary(true);

          console.log("🧠 Generating summary...");
          try {
            await generateSummaryWithInsights(localTranscript, event.id);
            console.log("✅ Summary generated");

            // Fetch the updated summary
            const updatedSummary = await getSummaryForMeeting(event.id);
            if (updatedSummary) {
              setSummaryData(updatedSummary);
            }
          } catch (err) {
            console.error("❌ Error generating summary:", err);
          } finally {
            setIsGeneratingSummary(false);
          }
        }
      }
    } catch (error) {
      console.error("❌ Recording error:", error);
      setIsRecording(false);
    }
  };

  // 🔍 Fetch transcript from the transcripts collection
  useEffect(() => {
    if (!event?.id) return;

    getTranscriptForMeeting(event.id).then((transcript) => {
      console.log("📥 TRANSCRIPT FETCH DEBUG:", transcript);
      if (transcript && transcript.length > 0) {
        setTranscriptData(transcript);
      } else {
        console.warn("⚠️ No transcript found in Firestore");
        setTranscriptData([]); // Explicitly set empty array when no transcript found
      }
    });

    getSummaryForMeeting(event.id).then((summary) => {
      console.log("📥 SUMMARY FETCH DEBUG:", summary);
      if (summary) {
        setSummaryData(summary);
      }
    });
  }, [event?.id]);

  const handleClose = () => {
    onClose();
    navigate(0); // This will refresh the current page
  };

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-[#F9F6F2] rounded-t-2xl">
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold text-[#4B3576]">
              {event.summary || "Untitled Meeting"}
            </h2>
            <p className="text-gray-600">
              {event.start?.dateTime
                ? new Date(event.start.dateTime).toLocaleString()
                : ""}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!hasStoppedRecording && (
              <button
                onClick={toggleRecording}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-[#4B3576] hover:bg-[#4B3576]/90 text-white"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isRecording ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 15l-3-3m0 0l3-3m-3 3h12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  )}
                </svg>
                <span>{isRecording ? "Stop" : "Start"} Recording</span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-[#4B3576] transition-all duration-200 p-2 hover:bg-[#4B3576]/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4B3576]/20"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-6 pb-0">
            <div className="flex space-x-2 mb-6 bg-gray-50 p-1 rounded-xl">
              {["summary", "transcript", "chat", "notes"].map((tabKey) => (
                <button
                  key={tabKey}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tab === tabKey
                      ? "bg-[#4B3576] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#4B3576] hover:bg-[#4B3576]/10"
                  }`}
                  onClick={() => setTab(tabKey)}
                >
                  {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0">
            <ErrorBoundary>
              {tab === "summary" && (
                <>
                  {isGeneratingSummary ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B3576]"></div>
                      <p className="text-gray-600 text-lg">
                        Generating summary... This may take a few moments.
                      </p>
                    </div>
                  ) : (
                    <MeetingSummary
                      summary={summaryData?.summary}
                      actionItems={summaryData?.actionItems}
                      insights={summaryData?.insights}
                    />
                  )}
                </>
              )}

              {tab === "transcript" && (
                <MeetingTranscript
                  eventId={event.id}
                  liveTriggerFunction={transcriptionService.current}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                />
              )}

              {tab === "chat" && (
                <div className="h-full">
                  <MeetingChat eventId={event.id} className="h-full" />
                </div>
              )}

              {tab === "notes" && (
                <div className="h-full">
                  <MeetingNotes meetingId={event.id} userId={userId} />
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
