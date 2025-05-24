import { useState, useEffect } from "react";
import type { CalendarEvent } from "~/types/meeting";
import { fetchCalendarEvents, formatEventTime } from "~/utils/api/calendar";

interface CalendarEventsProps {
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarEvents({ onEventClick }: CalendarEventsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const accessToken = localStorage.getItem("googleAccessToken");
        if (!accessToken) {
          setError("Please connect your Google Calendar");
          setLoading(false);
          return;
        }

        const calendarEvents = await fetchCalendarEvents(accessToken);
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error loading calendar events:", error);
        setError("Failed to load calendar events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return <div className="p-4 text-gray-500">No upcoming events found</div>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <button
          key={event.id}
          className="w-full text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onEventClick(event)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onEventClick(event);
            }
          }}
        >
          <h3 className="font-semibold text-lg">{event.summary}</h3>
          <p className="text-gray-600">{formatEventTime(event)}</p>
          {event.description && (
            <p className="mt-2 text-gray-700 line-clamp-2">
              {event.description}
            </p>
          )}
          {event.attendees && event.attendees.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {event.attendees.length} attendee
                {event.attendees.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
          {event.hangoutLink && (
            <a
              href={event.hangoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-500 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              Join Meeting
            </a>
          )}
        </button>
      ))}
    </div>
  );
}
