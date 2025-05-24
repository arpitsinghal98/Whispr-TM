import { useState } from "react";
import type { CalendarEvent } from "~/types/meeting";

interface UseMeetingModalReturn {
  selectedEvent: CalendarEvent | null;
  isModalOpen: boolean;
  openModal: (event: CalendarEvent) => void;
  closeModal: () => void;
}

export function useMeetingModal(): UseMeetingModalReturn {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return {
    selectedEvent,
    isModalOpen,
    openModal,
    closeModal,
  };
} 