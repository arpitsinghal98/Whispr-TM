import { useEffect, useState, useRef, useCallback } from "react";
import { MeetingInsights } from "~/types/meeting";
import { Summary } from "~/types/schema";
import {
  extractActionItems,
  generateMeetingInsights,
  generateMeetingSummary,
} from "~/utils/ai";
import { saveSummaryToFirestore } from "~/utils/api/meetings";
import { db, doc, setDoc, getDoc } from "~/utils/firestoreClient";

// Add type definitions for the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface MeetingCaptureProps {
  meetingId: string;
  isActive: boolean;
}

interface TranscriptSegment {
  text: string;
  timestamp: string;
  speaker?: string;
  confidence?: number;
}

export default function MeetingCapture({ meetingId }: MeetingCaptureProps) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [insights, setInsights] = useState<MeetingInsights | null>(null);

  const saveTranscriptToFirestore = useCallback(
    async (newTranscript: TranscriptSegment[]) => {
      try {
        console.log("Saving transcript to Firestore:", newTranscript);
        const transcriptId =
          newTranscript.map((segment) => segment.text).join(" ") + meetingId;
        const transcriptRef = doc(db, "transcripts", transcriptId);
        await setDoc(
          transcriptRef,
          {
            meetingId,
            transcript: newTranscript,
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log("Transcript saved successfully");
      } catch (error) {
        console.error("Error saving transcript:", error);
        setError("Failed to save transcript");
      }
    },
    [meetingId]
  );

  const restartRecognition = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    restartTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && isRecording) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.start();
        } catch (error) {
          console.error("Error restarting recognition:", error);
        }
      }
    }, 1000);
  }, [isRecording]);

  // Load existing transcript when component mounts
  useEffect(() => {
    async function loadTranscript() {
      try {
        const transcriptRef = doc(db, "transcripts", meetingId);
        const transcriptSnap = await getDoc(transcriptRef);

        if (transcriptSnap.exists()) {
          const data = transcriptSnap.data();
          if (data.transcript) {
            console.log("Loaded existing transcript:", data.transcript);
            setTranscript(data.transcript);
          }
        }
      } catch (error) {
        console.error("Error loading transcript:", error);
        setError("Failed to load existing transcript");
      }
    }

    loadTranscript();
  }, [meetingId]);

  // Initialize speech recognition
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const confidence = event.results[current][0].confidence;

        if (event.results[current].isFinal) {
          const newSegment: TranscriptSegment = {
            text: transcript,
            timestamp: new Date().toISOString(),
            confidence: confidence,
          };

          setTranscript((prev) => {
            const updatedTranscript = [...prev, newSegment];
            // saveTranscriptToFirestore(updatedTranscript);
            return updatedTranscript;
          });
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);

        if (
          isRecording &&
          (event.error === "no-speech" || event.error === "audio-capture")
        ) {
          restartRecognition();
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          restartRecognition();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [isRecording, restartRecognition, saveTranscriptToFirestore]);

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
        if (audioContextRef.current) {
          await audioContextRef.current.close();
        }
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
      } else {
        // Request audio permissions with optimal settings
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 44100,
          },
        });

        // Create audio context with optimal settings
        audioContextRef.current = new AudioContext({
          sampleRate: 44100,
          latencyHint: "interactive",
        });

        const source = audioContextRef.current.createMediaStreamSource(stream);
        const processor = audioContextRef.current.createScriptProcessor(
          4096,
          1,
          1
        );

        source.connect(processor);
        processor.connect(audioContextRef.current.destination);

        // Start speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }

        // Start media recorder
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
        mediaRecorderRef.current.start();
      }
      setIsRecording(!isRecording);
      setError(null);
    } catch (error) {
      console.error("Error toggling recording:", error);
      setError(
        "Failed to toggle recording. Please check your permissions and try again."
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#4B3576]">
          Meeting Capture
        </h3>
        <div className="flex items-center gap-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            onClick={toggleRecording}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                toggleRecording();
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">Live Transcript</h4>
        <div className="bg-gray-100 rounded-lg p-4 h-[400px] overflow-y-auto">
          {transcript.map((segment, index) => (
            <div key={index} className="mb-2">
              <div className="text-xs text-gray-500">
                {new Date(segment.timestamp).toLocaleTimeString()}
                {segment.confidence && (
                  <span className="ml-2 text-gray-400">
                    Confidence: {Math.round(segment.confidence * 100)}%
                  </span>
                )}
              </div>
              <div className="text-gray-700">{segment.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
