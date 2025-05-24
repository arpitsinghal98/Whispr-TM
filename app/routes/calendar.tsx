import Navbar from "~/components/Navbar";
import { useState } from "react";

export default function CalendarConnect() {
  const [connected, setConnected] = useState(false);
  // Placeholder events
  const events = [
    { id: 1, title: "Team Sync", time: "2024-06-01 10:00" },
    { id: 2, title: "Client Call", time: "2024-06-02 14:00" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F6F2]">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-[#4B3576]">Connect your Google Calendar</h1>
        {!connected ? (
          <button
            className="bg-[#4B3576] text-white px-6 py-3 rounded-xl font-semibold text-lg mb-6"
            onClick={() => setConnected(true)}
          >
            Connect Google Calendar
          </button>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
            <ul className="space-y-2">
              {events.map(ev => (
                <li key={ev.id} className="bg-gray-100 rounded p-3 flex justify-between items-center">
                  <span>{ev.title}</span>
                  <span className="text-sm text-gray-500">{ev.time}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
} 