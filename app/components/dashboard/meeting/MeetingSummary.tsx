import type { MeetingInsights } from "~/types/meeting";

interface MeetingSummaryProps {
  summary?: string;
  actionItems?: string[];
  insights?: MeetingInsights | null;
}

export default function MeetingSummary({
  summary,
  actionItems,
  insights,
}: MeetingSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-[#4B3576] mb-3 flex items-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Summary
        </h3>
        <pre className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {summary}
        </pre>
      </div>

      {/* Action Items Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-[#4B3576] mb-3 flex items-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Action Items
        </h3>
        <ul className="space-y-2">
          {actionItems?.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 bg-[#4B3576] rounded-full mt-2 mr-3"></span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Insights Section */}
      {insights && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-[#4B3576] mb-3 flex items-center">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Insights
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-1">Sentiment</p>
              <p className="text-gray-600">{insights.sentiment}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">Key Topics</p>
              <div className="flex flex-wrap gap-2">
                {insights.keyTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#4B3576]/10 text-[#4B3576] rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">Decisions</p>
              <ul className="space-y-2">
                {insights.decisions.map((decision, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-[#4B3576] rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
