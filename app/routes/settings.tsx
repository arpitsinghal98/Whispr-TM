import Navbar from "~/components/Navbar";
import { useState } from "react";

export default function Settings() {
  const [language, setLanguage] = useState("English");
  const [instructions, setInstructions] = useState("");

  return (
    <div className="min-h-screen bg-[#F9F6F2]">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-[#4B3576]">Settings</h1>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Preferred Language</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Hindi</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Personal Instructions</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={3}
            placeholder="Tell Whispr more about you, your preferences, etc."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />
        </div>
        <button className="bg-[#4B3576] text-white px-6 py-2 rounded-xl font-semibold">Save Settings</button>
      </div>
    </div>
  );
} 