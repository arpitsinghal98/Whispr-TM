import type { CalendarEvent } from "~/types/meeting";
import { CalendarError } from "~/utils/errors";

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('googleAccessToken');
}

export async function fetchCalendarEvents(calAccessToken: string): Promise<CalendarEvent[]> {
  try {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=10`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${calAccessToken}` },
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new CalendarError(
        error.error?.message || `Failed to fetch calendar events: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error;
    }
    throw new CalendarError(
      error instanceof Error ? error.message : "Failed to fetch calendar events"
    );
  }
}

export function formatEventTime(event: CalendarEvent): string {
  const start = event.start?.dateTime || event.start?.date;
  return start ? new Date(start).toLocaleString() : "";
} 