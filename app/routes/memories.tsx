import Navbar from "~/components/Navbar";
import { useState, useEffect } from "react";
import { db, collection, getDocs, query, where } from "~/utils/firestoreClient";
import { auth } from "~/utils/firebaseClient";

export default function Memories() {
  const [search, setSearch] = useState("");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeetings() {
      setLoading(true);
      setError(null);
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to view memories.");
          setMeetings([]);
          setLoading(false);
          return;
        }
        const q = query(collection(db, "meetings"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e: any) {
        setError(e.message || "Failed to load memories.");
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  const filtered = meetings.filter(m =>
    (m.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (m.summary?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9F6F2]">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-[#4B3576]">Memories</h1>
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Search memories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ul className="space-y-4">
            {filtered.map(mem => (
              <li key={mem.id} className="bg-gray-100 rounded p-3">
                <div className="font-semibold text-[#4B3576]">{mem.title}</div>
                <div className="text-gray-700">{mem.summary}</div>
              </li>
            ))}
            {filtered.length === 0 && <li className="text-gray-400">No memories found.</li>}
          </ul>
        )}
      </div>
    </div>
  );
} 