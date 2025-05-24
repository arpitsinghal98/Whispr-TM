import Navbar from "~/components/Navbar";
import { useState, useEffect } from "react";
import {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "~/utils/firestoreClient";
import { auth } from "~/utils/firebaseClient";

export default function PastMeetings() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    async function fetchMeetings() {
      setLoading(true);
      setError(null);
      try {
        const user = JSON.parse(localStorage.getItem("user") as string) as any;
        console.log("user -> ", user);
        if (!user) {
          setError("You must be logged in to view past meetings.");
          setMeetings([]);
          setLoading(false);
          return;
        }
        const q = query(
          collection(db, "meetings"),
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        setMeetings(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (e: any) {
        setError(e.message || "Failed to load past meetings.");
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2]">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-[#4B3576] mb-6">
          Past Meetings
        </h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search past meetings..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B3576]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B3576] mb-2">
                      {meeting.title || "Untitled Meeting"}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {formatDate(meeting.date)}
                    </p>
                    {meeting.summary && (
                      <p className="text-gray-700 mb-4">{meeting.summary}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setModalOpen(true);
                    }}
                    className="bg-[#4B3576] text-white px-4 py-2 rounded-lg hover:bg-[#3a285c] transition"
                  >
                    View Details
                  </button>
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

      {/* Meeting Details Modal */}
      {modalOpen && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-[#4B3576] mb-4">
              {selectedMeeting.title || "Untitled Meeting"}
            </h2>
            <p className="text-gray-600 mb-6">
              {formatDate(selectedMeeting.date)}
            </p>

            <div className="space-y-6">
              {selectedMeeting.transcript && (
                <div>
                  <h3 className="text-lg font-semibold text-[#4B3576] mb-2">
                    Transcript
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                    {selectedMeeting.transcript}
                  </div>
                </div>
              )}

              {selectedMeeting.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-[#4B3576] mb-2">
                    Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {selectedMeeting.notes}
                  </div>
                </div>
              )}

              {selectedMeeting.summary && (
                <div>
                  <h3 className="text-lg font-semibold text-[#4B3576] mb-2">
                    Summary
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {selectedMeeting.summary}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
