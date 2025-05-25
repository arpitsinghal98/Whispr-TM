import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { signInWithGoogle, auth } from "~/utils/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export const meta: MetaFunction = () => [
  { title: "Whispr – Your AI-Powered Meeting Assistant" },
  {
    name: "description",
    content:
      "Record, transcribe, summarize, and chat with your meetings – in real time.",
  },
];

export default function Index() {
  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     window.location.href = "/dashboard";
    //   }
    // });
    // return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#4B3576] font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Whispr Logo" className="h-10" />
        </div>
        <nav className="flex gap-8 text-white text-base font-medium">
          <a href="/about" className="hover:underline">
            About
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-2 pb-2 mt-8 flex flex-col md:flex-row items-center md:items-stretch justify-center overflow-visible min-h-[300px]">
        {/* Left: Hero Text */}
        <div className="flex-1 flex flex-col justify-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Your AI-Powered
            <br />
            Meeting Assistant
          </h1>
          <p className="text-white/80 text-xl mb-10 max-w-xl">
            Record, transcribe, summarize, and chat with your meetings – in real
            time.
          </p>
          <div className="flex gap-4 mb-16">
            <button
              className="bg-white text-[#4B3576] font-semibold rounded-xl px-7 py-3 text-lg shadow hover:bg-gray-100 transition"
              onClick={async () => {
                try {
                  await signInWithGoogle();
                  window.location.href = "/dashboard";
                } catch (e) {
                  alert("Sign in failed");
                }
              }}
            >
              Start Free
            </button>
            <button className="bg-white/10 text-white font-semibold rounded-xl px-7 py-3 text-lg border border-white/20 hover:bg-white/20 transition">
              Watch Demo
            </button>
          </div>
        </div>
        {/* Right: Soundwave, centered in right half */}
        <div className="flex-1 relative min-h-[180px] md:min-h-0 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <img
              src="/soundwave.svg"
              alt="Soundwave"
              className="w-[380px] md:w-[500px] lg:w-[600px] opacity-20"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#F9F6F2] w-full py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          {/* Left: Steps */}
          <div className="flex-1 flex flex-col gap-10">
            <h2 className="text-3xl font-bold text-[#2D2150] mb-2">
              How It Works
            </h2>
            <div className="flex flex-col gap-8">
              {/* Step 1 */}
              <div className="flex items-start gap-6">
                <div className="bg-[#4B3576] rounded-full p-4 flex items-center justify-center">
                  {/* Mic Icon */}
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 18v2m0 0h3m-3 0H9m6-6a3 3 0 01-6 0V7a3 3 0 016 0v5z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[#2D2150]">
                    Start Meeting
                  </div>
                  <div className="text-[#4B3576] text-base">
                    Tap to begin real-time transcription.
                  </div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-start gap-6">
                <div className="bg-[#4B3576] rounded-full p-4 flex items-center justify-center">
                  {/* Soundwave Icon */}
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 12v2m4-6v10m4-14v18m4-14v10m4-6v2"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[#2D2150]">
                    Let Whispr Listen
                  </div>
                  <div className="text-[#4B3576] text-base">
                    AI transcribes and summarizes while you talk
                  </div>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-start gap-6">
                <div className="bg-[#4B3576] rounded-full p-4 flex items-center justify-center">
                  {/* Chat Icon */}
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 8h10M7 12h6m-6 4h8m-8 4v-2a2 2 0 012-2h8a2 2 0 012 2v2"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[#2D2150]">
                    Chat & Review
                  </div>
                  <div className="text-[#4B3576] text-base">
                    Get a summary, and ask follow-up questions
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right: UI Mockup */}
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-[350px] md:w-[400px]">
              <div className="font-bold text-[#2D2150] text-lg mb-2">
                Project Kickoff
              </div>
              <div className="text-xs text-gray-400 mb-4">
                Acolissemte 7, die • 9 1FAM
              </div>
              <div className="h-16 bg-gray-100 rounded mb-2" />
              <div className="h-4 bg-gray-100 rounded mb-2 w-5/6" />
              <div className="h-4 bg-gray-100 rounded mb-2 w-2/3" />
              <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
              <div className="flex gap-2 mt-4">
                <div className="flex-1 bg-gray-50 rounded p-2 text-xs text-gray-500">
                  It is sompors enroiping ispetting precatioive...
                </div>
                <div className="flex-1 bg-gray-50 rounded p-2 text-xs text-gray-500">
                  How can I diloplewith ir feeh conrect
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="flex-1 bg-gray-50 rounded p-2 text-xs text-gray-500">
                  About Vty-motifets
                </div>
              </div>
              <div className="mt-4">
                <div className="font-semibold text-[#4B3576] text-xs mb-1">
                  Key Points
                </div>
                <ul className="text-xs text-gray-700 mb-2">
                  <li>Actio-varic.</li>
                  <li>Actape elitems</li>
                </ul>
                <div className="font-semibold text-[#4B3576] text-xs mb-1">
                  Decisions
                </div>
                <ul className="text-xs text-gray-700">
                  <li>Or Any-oe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Whispr Section */}
      <section className="bg-white w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2D2150] mb-10">
            Why Whispr?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="flex items-center gap-4">
              <svg
                width="36"
                height="36"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4B3576"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 12v2m4-6v10m4-14v18m4-14v10m4-6v2"
                />
              </svg>
              <div className="text-lg font-medium text-[#2D2150]">
                Real-Time AI Transcription
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-center gap-4">
              <svg
                width="36"
                height="36"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4B3576"
              >
                <rect
                  x="4"
                  y="6"
                  width="16"
                  height="12"
                  rx="2"
                  strokeWidth="2"
                />
                <path
                  d="M8 10h8M8 14h5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-lg font-medium text-[#2D2150]">
                Automatic Meeting Summaries
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex items-center gap-4">
              <svg
                width="36"
                height="36"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4B3576"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  strokeWidth="2"
                />
                <path
                  d="M8 11h8M8 15h5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="15"
                  y="2"
                  width="6"
                  height="6"
                  rx="1"
                  strokeWidth="2"
                />
              </svg>
              <div className="text-lg font-medium text-[#2D2150]">
                Google Calendar Integration
              </div>
            </div>
            {/* Feature 4 */}
            <div className="flex items-center gap-4">
              <svg
                width="36"
                height="36"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4B3576"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="4"
                  strokeWidth="2"
                />
                <path d="M8 12h8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="text-lg font-medium text-[#2D2150]">
                Works on Any Device
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
