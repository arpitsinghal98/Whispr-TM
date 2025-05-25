import { useState, useEffect } from "react";
import type { CalendarEvent } from "~/types/meeting";
import { fetchCalendarEventsForDisplay } from "~/utils/api/calendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";

interface CalendarViewProps {
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarView({ onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Get the first day of the month and create padding for the start of the grid
  const firstDayOfMonth = startOfMonth(currentDate);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    const accessToken = localStorage.getItem("googleAccessToken");
    if (!accessToken) {
      setError("Please connect your Google Calendar");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const calendarEvents = await fetchCalendarEventsForDisplay(
        accessToken,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setEvents(calendarEvents);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    fetchEvents(startDate, endDate);
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.start?.dateTime 
        ? new Date(event.start.dateTime)
        : event.start?.date 
          ? new Date(event.start.date)
          : null;
      return eventDate && isSameDay(eventDate, date);
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-[#4B3576]">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, index) => (
          <div
            key={`padding-${index}`}
            className="min-h-[100px] p-2 border border-gray-100 rounded-lg bg-gray-50"
          />
        ))}
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <div
              key={day.toString()}
              className={`
                min-h-[100px] p-2 border rounded-lg cursor-pointer
                ${!isSameMonth(day, currentDate) ? "bg-gray-50" : "bg-white"}
                ${isToday(day) ? "border-[#4B3576]" : "border-gray-200"}
                ${isSelected ? "ring-2 ring-[#4B3576]" : ""}
                hover:border-[#4B3576] transition-colors
              `}
              onClick={() => handleDateClick(day)}
            >
              <div className="text-sm font-medium mb-1">
                {format(day, "d")}
              </div>
              {dayEvents.length > 0 && (
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-[#4B3576] text-white rounded truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      {event.summary}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Events for {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => onEventClick(event)}
              >
                <div className="font-medium">{event.summary}</div>
                <div className="text-sm text-gray-600">
                  {event.start?.dateTime
                    ? format(new Date(event.start.dateTime), "h:mm a")
                    : "All day"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B3576]"></div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 