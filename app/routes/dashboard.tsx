import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { auth } from "~/utils/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "~/components/Navbar";
import CalendarEvents from "~/components/dashboard/calendar/CalendarEvents";
import MeetingModal from "~/components/dashboard/meeting/MeetingModal";
import PendingInvitations from "~/components/dashboard/invitations/PendingInvitations";
import { useMeetingModal } from "~/hooks/useMeetingModal";
import ErrorBoundary from "~/components/ErrorBoundary";

export const meta: MetaFunction = () => [
  { title: "Dashboard | Whispr" },
];

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const { selectedEvent, isModalOpen, openModal, closeModal } = useMeetingModal();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          {userId && <PendingInvitations userId={userId} />}
        </ErrorBoundary>

        <h1 className="text-2xl font-bold mb-6">Upcoming Meetings</h1>
        <ErrorBoundary>
          <CalendarEvents onEventClick={openModal} />
        </ErrorBoundary>
      </main>

      <ErrorBoundary>
        <MeetingModal
          open={isModalOpen}
          onClose={closeModal}
          event={selectedEvent}
          userId={userId || ""}
        />
      </ErrorBoundary>
    </div>
  );
} 