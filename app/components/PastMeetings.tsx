import { useState, useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { db } from "~/utils/firestoreClient";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { format } from "date-fns";

interface Meeting {
  id: string;
  title: string;
  date: string;
  summary?: string;
  transcript?: string | Array<{ text: string; timestamp: string }>;
}

export default function PastMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log("Auth state in PastMeetings:", { user, authLoading });
  }, [user, authLoading]);

  useEffect(() => {
    async function fetchMeetings() {
      console.log("Fetching meetings, auth state:", { user, authLoading });

      // Wait for auth to be ready
      if (authLoading) {
        console.log("Auth still loading, waiting...");
        return;
      }

      if (!user) {
        console.log("No user found, stopping fetch");
        setLoading(false);
        return;
      }

      try {
        console.log("Starting to fetch meetings for user:", user.uid);
        setLoading(true);
        const meetingsRef = collection(db, "meetings");

        // Query meetings for this user, ordered by date descending
        const q = query(
          meetingsRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        const now = new Date();

        // Only include meetings whose date is in the past
        const meetingsData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((meeting: any) => {
            // Ensure meeting.date exists and is in the past
            if (!meeting.date) return false;
            const meetingDate = new Date(meeting.date);
            return meetingDate < now;
          }) as Meeting[];

        console.log("Fetched past meetings:", meetingsData);
        setMeetings(meetingsData);
        setError(null);
      } catch (err: any) {
        // If the error is about missing index, show a specific message
        if (
          err.code === "failed-precondition" &&
          err.message.includes("index")
        ) {
          setError(
            "The database is being set up. Please try again in a few moments."
          );
          console.log("Index is being created, will retry automatically");
          setTimeout(fetchMeetings, 5000);
          return;
        }
        console.error("Error fetching meetings:", err);
        setError("Failed to load meetings. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchMeetings();
  }, [user, authLoading]);

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.summary &&
        meeting.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4B3576] mb-4">
            Past Meetings
          </h2>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show sign in message if no user after auth is ready
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4B3576] mb-4">
            Past Meetings
          </h2>
          <p className="text-gray-600">
            Please sign in to view your past meetings.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching meetings
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4B3576] mb-4">
            Past Meetings
          </h2>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4B3576] mb-4">
            Past Meetings
          </h2>
          <p className="text-red-500">{error}</p>
          {error.includes("database is being set up") && (
            <p className="text-gray-600 mt-2">
              This is normal for first-time setup. Please wait a moment...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4B3576]">Past Meetings</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search past meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B3576] focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {filteredMeetings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No meetings found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {meeting.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(meeting.date), "MMMM d, yyyy h:mm a")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    (window.location.href = `/meeting/${meeting.id}`)
                  }
                  className="text-[#4B3576] hover:text-[#3a285c] font-medium"
                >
                  View Details
                </button>
              </div>
              {meeting.summary && (
                <p className="mt-2 text-gray-600 line-clamp-2">
                  {meeting.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
