import type { CalendarEvent } from "~/types/meeting";
import { CalendarError } from "~/utils/errors";
import { saveMeetingToFirestore } from "./meetings";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("googleAccessToken");
}

export async function fetchCalendarEvents(
  calAccessToken: string
): Promise<CalendarEvent[]> {
  try {
    const now = new Date();
    const today = now.toISOString(); // 'timeMin' (today)

    // Calculate the upcoming Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7; // Days remaining until Sunday
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    const sunday = nextSunday.toISOString(); // 'timeMax' (upcoming Sunday)

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${today}&timeMax=${sunday}&singleEvents=true&orderBy=startTime&conferenceDataVersion=1`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${calAccessToken}` },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new CalendarError(
        error.error?.message ||
          `Failed to fetch calendar events: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    // Filter events that have Google Meet link in them
    const meetEvents = data.items.filter((event: any) => {
      return event.conferenceData && event.conferenceData.entryPoints
        ? event.conferenceData.entryPoints.some(
            (entry: any) => entry.entryPointType === "video" && entry.uri
          )
        : false;
    });

    saveMeetingToFirestore(meetEvents);
    console.log("meetEvents -> ", meetEvents);
    return meetEvents || [];
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error;
    }
    throw new CalendarError(
      error instanceof Error ? error.message : "Failed to fetch calendar events"
    );
  }
}

export async function fetchCalendarEventsForDisplay(
  calAccessToken: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=100&conferenceDataVersion=1`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${calAccessToken}` },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new CalendarError(
        error.error?.message ||
          `Failed to fetch calendar events: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    // Filter events that have Google Meet link in them
    const meetEvents = data.items.filter((event: CalendarEvent) => {
      return event.conferenceData && event.conferenceData.entryPoints
        ? event.conferenceData.entryPoints.some(
            (entry) => entry.entryPointType === "video" && entry.uri
          )
        : false;
    });

    return meetEvents || [];
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
