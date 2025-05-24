import type { CalendarEvent } from "~/types/meeting";

interface CalendarEventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

export default function CalendarEventCard({ event, onClick }: CalendarEventCardProps) {
  const formatEventTime = (event: CalendarEvent) => {
    const start = event.start?.dateTime || event.start?.date;
    return start ? new Date(start).toLocaleString() : "";
  };

  return (
    <button
      className="w-full text-left p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative border border-gray-100"
      onClick={() => onClick(event)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(event);
        }
      }}
    >
      {event.hangoutLink && (
        <a
          href={event.hangoutLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 px-4 py-2 bg-[#4B3576] text-white text-sm rounded-lg hover:bg-[#3a285c] transition-colors duration-200 font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Join Meeting
        </a>
      )}
      <div className="pr-32">
        <h3 className="font-semibold text-xl text-[#4B3576] mb-2">{event.summary}</h3>
        <p className="text-gray-600 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatEventTime(event)}
        </p>
        {event.description && (
          <p className="mt-3 text-gray-700 line-clamp-2 bg-gray-50 p-3 rounded-lg text-sm">
            {event.description}
          </p>
        )}
        {event.attendees && event.attendees.length > 0 && (
          <div className="mt-4 flex items-center">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm text-gray-500">
              {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </button>
  );
} 