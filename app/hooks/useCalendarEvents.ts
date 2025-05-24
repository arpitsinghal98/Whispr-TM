import { useState, useEffect } from "react";
import type { CalendarEvent } from "~/types/meeting";
import { fetchCalendarEvents } from "~/utils/api/calendar";
import { AuthError, CalendarError, isAppError } from "~/utils/errors";

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
}

export function useCalendarEvents(): UseCalendarEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem("googleAccessToken");
      if (!accessToken) {
        throw new AuthError("Please connect your Google Calendar");
      }

      const calendarEvents = await fetchCalendarEvents(accessToken);
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error loading calendar events:", error);

      if (isAppError(error)) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred while loading calendar events");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,
    error,
    refreshEvents: loadEvents,
  };
}
