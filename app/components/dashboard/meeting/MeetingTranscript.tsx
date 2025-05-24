import { useCallback, useEffect, useState, useRef } from "react";
import { updateMeetingData } from "~/utils/api/meetings";
import AudioTranscriptionService from "~/utils/audioTranscription";

interface TranscriptSegment {
  text: string;
  timestamp: string;
}

interface MeetingTranscriptProps {
  eventId: string;
  transcript: TranscriptSegment[];
  className?: string;
}

export default function MeetingTranscript({ eventId, transcript = [], className = "" }: MeetingTranscriptProps) {
  const [localTranscript, setLocalTranscript] = useState<TranscriptSegment[]>(transcript);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptionService = useRef<AudioTranscriptionService | null>(null);

  useEffect(() => {
    if (transcript) {
      setLocalTranscript(transcript);
    }
  }, [transcript]);

  const saveTranscriptUpdate = useCallback(async (newTranscript: TranscriptSegment[]) => {
    try {
      await updateMeetingData(eventId, { transcript: newTranscript });
    } catch (error) {
      console.error('Error saving transcript update:', error);
    }
  }, [eventId]);

  useEffect(() => {
    if (localTranscript !== transcript) {
      saveTranscriptUpdate(localTranscript);
    }
  }, [localTranscript, transcript, saveTranscriptUpdate]);

  const handleTranscriptionUpdate = useCallback((newSegments: TranscriptSegment[]) => {
    setLocalTranscript(prev => [...prev, ...newSegments]);
  }, []);

  const clearTranscript = useCallback(async () => {
    try {
      // Clear local state
      setLocalTranscript([]);
      // Update database
      await updateMeetingData(eventId, { transcript: [] });
      // Stop recording if active
      if (isRecording && transcriptionService.current) {
        transcriptionService.current.stopRecording();
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error clearing transcript:', error);
      setError('Failed to clear transcript');
    }
  }, [eventId, isRecording]);

  const toggleRecording = async () => {
    try {
      setError(null);
      
      if (!isRecording) {
        // Initialize service if not exists
        if (!transcriptionService.current) {
          transcriptionService.current = new AudioTranscriptionService(handleTranscriptionUpdate);
        }
        
        await transcriptionService.current.startRecording();
        setIsRecording(true);
      } else {
        transcriptionService.current?.stopRecording();
        setIsRecording(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle recording');
      setIsRecording(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Meeting Transcript</h3>
        <div className="flex items-center space-x-2">
          {localTranscript.length > 0 && (
            <button
              onClick={clearTranscript}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-[#4B3576] hover:bg-[#4B3576]/90 text-white"
            }`}
          >
            <svg 
              className="w-5 h-5" 
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
            <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!localTranscript || localTranscript.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          No transcript available yet. Click "Start Recording" to begin.
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {localTranscript.map((segment, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
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