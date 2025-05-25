import { useState, useCallback, useEffect } from "react";
import { chatWithAI } from "~/utils/ai";
import {
  getTranscriptForMeeting,
  getChatForMeeting,
  saveChatToFirestore,
} from "~/utils/api/meetings";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface ChatMessage {
  q: string;
  a: string;
}

interface TranscriptSegment {
  text: string;
  timestamp: string;
}

interface MeetingChatProps {
  eventId: string;
  className?: string;
}

export default function MeetingChat({
  eventId,
  className = "",
}: MeetingChatProps) {
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transcriptData, chatData] = await Promise.all([
          getTranscriptForMeeting(eventId),
          getChatForMeeting(eventId)
        ]);
        setTranscript(transcriptData || []);
        setChatHistory(chatData || []);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load meeting data.");
      }
    };
    loadData();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatLoading(true);
    setError(null);

    try {
      const response = await chatWithAI({ transcript, question: chatInput });
      const newChat = [...chatHistory, { q: chatInput, a: response }];
      setChatHistory(newChat);
      setChatInput("");

      // Save updated chat to Firestore
      await saveChatToFirestore(eventId, newChat);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = useCallback(async () => {
    try {
      setChatHistory([]);
      await saveChatToFirestore(eventId, []);
    } catch (error) {
      console.error("Error clearing chat:", error);
      setError("Failed to clear chat history");
    }
  }, [eventId]);

  const components: Components = {
    p: ({ children }) => <p className="text-gray-700">{children}</p>,
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    u: ({ children }) => <u className="underline">{children}</u>,
    code: ({ children }) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-100 p-2 rounded-lg overflow-x-auto my-2">
        {children}
      </pre>
    ),
    ul: ({ children }) => <ul className="list-disc pl-4 my-2">{children}</ul>,
    ol: ({ children }) => (
      <ol className="list-decimal pl-4 my-2">{children}</ol>
    ),
    li: ({ children }) => <li className="my-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#4B3576] pl-4 my-2 italic">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-[#4B3576] hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  const renderMessage = (text: string) => {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Chat</h3>
        {chatHistory.length > 0 && (
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Clear</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {chatHistory.length === 0 ? (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            No messages yet. Start a conversation!
          </div>
        ) : (
          chatHistory.map((message, index) => (
            <div key={index} className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Question:</p>
                <p className="text-gray-700">{message.q}</p>
              </div>
              <div className="bg-[#4B3576]/5 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Answer:</p>
                <div className="text-gray-700">{renderMessage(message.a)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask a question about the meeting..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B3576]/20 focus:border-[#4B3576]"
          disabled={chatLoading}
        />
        <button
          type="submit"
          disabled={chatLoading || !chatInput.trim()}
          className="px-4 py-2 bg-[#4B3576] text-white rounded-lg hover:bg-[#4B3576]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {chatLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
