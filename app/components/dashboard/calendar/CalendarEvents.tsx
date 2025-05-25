import { useState, useEffect } from "react";
import type { CalendarEvent } from "~/types/meeting";
import { formatEventTime } from "~/utils/api/meetings";
import CalendarEventCard from "./CalendarEventCard";
import ErrorBoundary from "~/components/ErrorBoundary";
import { fetchCalendarEvents, getAccessToken } from "~/utils/api/calendar";

interface CalendarEventsProps {
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarEvents({ onEventClick }: CalendarEventsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("Please connect your Google Calendar");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const calendarEvents = await fetchCalendarEvents(accessToken);
      console.log("calendarEvents -> ", calendarEvents);

      // Format the time for each event
      const formattedEvents = calendarEvents.map((event: CalendarEvent) => ({
        ...event,
        start: {
          ...event.start,
          dateTime: formatEventTime(event.start?.dateTime),
        },
        end: {
          ...event.end,
          dateTime: formatEventTime(event.end?.dateTime),
        },
      }));

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError("Failed to load calendar events");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B3576]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return <div className="p-4 text-gray-500">No upcoming events found</div>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {events.map((event) => (
          <CalendarEventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
}
