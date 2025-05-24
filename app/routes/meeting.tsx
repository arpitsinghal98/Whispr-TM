import Navbar from "~/components/Navbar";
import MeetingTranscriber from "~/components/MeetingTranscriber";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

export default function MeetingPage() {
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedMeeting = localStorage.getItem('currentMeeting');
    if (!storedMeeting) {
      // If no meeting details are found, redirect back to dashboard
      navigate('/dashboard');
      return;
    }
    setMeetingDetails(JSON.parse(storedMeeting));
  }, [navigate]);

  if (!meetingDetails) {
    return (
      <div className="min-h-screen bg-[#F9F6F2]">
        <Navbar />
        <div className="max-w-2xl mx-auto py-10 px-6">
          <div className="text-gray-500">Loading meeting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2]">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold text-[#4B3576] mb-6">{meetingDetails.summary}</h1>
        <MeetingTranscriber meetingDetails={meetingDetails} />
      </div>
    </div>
  );
} 