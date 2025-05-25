import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import Navbar from "~/components/Navbar";
import CalendarView from "~/components/CalendarView";
import MeetingModal from "~/components/dashboard/meeting/MeetingModal";
import { useMeetingModal } from "~/hooks/useMeetingModal";
import ErrorBoundary from "~/components/ErrorBoundary";

export const meta: MetaFunction = () => [
  { title: "Calendar View | Whispr" },
];

export default function CalendarViewPage() {
  const { selectedEvent, isModalOpen, openModal, closeModal } = useMeetingModal();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Calendar View</h1>
        <ErrorBoundary>
          <CalendarView onEventClick={openModal} />
        </ErrorBoundary>
      </main>

      <ErrorBoundary>
        <MeetingModal
          open={isModalOpen}
          onClose={closeModal}
          event={selectedEvent}
          userId=""
        />
      </ErrorBoundary>
    </div>
  );
} 