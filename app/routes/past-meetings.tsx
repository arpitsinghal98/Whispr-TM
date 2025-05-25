import Navbar from "~/components/Navbar";
import { useState, useEffect } from "react";
import { retrieveAllMeetings } from "~/utils/api/meetings";
import type { CalendarEvent } from "~/types/meeting";
import MeetingModal from "~/components/dashboard/meeting/MeetingModal";

export default function PastMeetings() {
  const [meetings, setMeetings] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<CalendarEvent | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "week" | "month" | "year"
  >("all");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    async function fetchMeetings() {
      setLoading(true);
      setError(null);
      try {
        const user = JSON.parse(localStorage.getItem("user") as string) as any;
        if (!user) {
          setError("You must be logged in to view past meetings.");
          setMeetings([]);
          setLoading(false);
          return;
        }

        setUserId(user.email);
        const allMeetings = await retrieveAllMeetings();
        const now = new Date();

        const filteredMeetings = allMeetings.filter((meeting) => {
          if (meeting.creator?.email !== user.email) return false;
          const meetingDate = meeting.start?.dateTime
            ? new Date(meeting.start.dateTime)
            : null;
          if (!meetingDate || meetingDate >= now) return false;

          if (dateFilter !== "all") {
            const startDate = new Date();
            switch (dateFilter) {
              case "week":
                startDate.setDate(now.getDate() - 7);
                break;
              case "month":
                startDate.setMonth(now.getMonth() - 1);
                break;
              case "year":
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            }
            if (meetingDate < startDate) return false;
          }

          return true;
        });

        filteredMeetings.sort((a, b) => {
          const dateA = a.start?.dateTime
            ? new Date(a.start.dateTime)
            : new Date(0);
          const dateB = b.start?.dateTime
            ? new Date(b.start.dateTime)
            : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setMeetings(filteredMeetings);
      } catch (e: any) {
        setError(e.message || "Failed to load past meetings.");
      } finally {
        setLoading(false);
      }
    }

    fetchMeetings();
  }, [dateFilter]);

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatDate(dateString?: string) {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleString();
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2]">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-[#4B3576] mb-6">
          Past Meetings
        </h1>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search past meetings..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B3576]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B3576]"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading past meetings...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setModalOpen(true);
                }}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B3576] mb-2">
                      {meeting.summary || "Untitled Meeting"}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {formatDate(meeting.start?.dateTime)}
                    </p>
                    {meeting.description && (
                      <p className="text-gray-700 mb-4">
                        {meeting.description}
                      </p>
                    )}
                  </div>
                  {meeting.hangoutLink && (
                    <a
                      href={meeting.hangoutLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#4B3576] text-white px-4 py-2 rounded-lg hover:bg-[#3a285c] transition"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              </div>
            ))}
            {filteredMeetings.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No past meetings found.
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && selectedMeeting && (
        <MeetingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          event={selectedMeeting}
          userId={userId}
          showRecordingButton={false}
        />
      )}
    </div>
  );
}
