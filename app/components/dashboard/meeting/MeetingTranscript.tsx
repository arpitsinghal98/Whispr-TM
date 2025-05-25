import { useEffect, useState } from "react";
import {
  subscribeToTranscript,
  saveTranscriptToFirestore,
} from "~/utils/api/meetings";
import AudioTranscriptionService from "~/utils/audioTranscription";

interface TranscriptSegment {
  text: string;
  timestamp: string;
}

interface MeetingTranscriptProps {
  eventId: string;
  className?: string;
  liveTriggerFunction: AudioTranscriptionService | null;
}

export default function MeetingTranscript({
  eventId,
  className = "",
  liveTriggerFunction,
}: MeetingTranscriptProps) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time transcript updates from Firestore
  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = subscribeToTranscript(eventId, (newTranscript) => {
      console.log(
        "📥 Received transcript update from Firestore:",
        newTranscript
      );
      setTranscript(newTranscript);
    });

    return () => {
      console.log("🧹 Cleaning up transcript subscription");
      unsubscribe();
    };
  }, [eventId]);

  useEffect(() => {
    if (!liveTriggerFunction || !eventId) return;

    const handleTranscriptUpdate = async (segments: TranscriptSegment[]) => {
      console.log("🎤 New transcript segments:", segments);

      // Update local state immediately for UI responsiveness
      setTranscript((prev) => [...prev, ...segments]);

      try {
        await saveTranscriptToFirestore(segments, eventId, false);
      } catch (err) {
        console.error("❌ Error saving transcript:", err);
        setError("Failed to save transcript");
      }
    };

    return () => {
      // No cleanup needed as the service handles its own cleanup
    };
  }, [liveTriggerFunction, eventId]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Meeting Transcript
        </h3>
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
      )}

      {transcript.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          No transcript available yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {transcript.map((segment, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <p className="text-sm text-gray-500 mb-1">
                {new Date(segment.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-gray-700">{segment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
