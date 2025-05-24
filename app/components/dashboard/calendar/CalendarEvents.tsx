import type { CalendarEvent } from "~/types/meeting";
import { useCalendarEvents } from "~/hooks/useCalendarEvents";
import CalendarEventCard from "./CalendarEventCard";
import ErrorBoundary from "~/components/ErrorBoundary";

interface CalendarEventsProps {
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarEvents({ onEventClick }: CalendarEventsProps) {
  const { events, loading, error, refreshEvents } = useCalendarEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={refreshEvents}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No upcoming events found
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {events.map((event) => (
          <CalendarEventCard
            key={event.id}
            event={event}
            onClick={onEventClick}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
} 