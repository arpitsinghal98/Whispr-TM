import { useState, useEffect } from "react";
import type { MeetingInvitation } from "~/utils/meetingInvitations";
import { getPendingInvitations, acceptMeetingInvitation } from "~/utils/meetingInvitations";
import { isAppError } from "~/utils/errors";
import InvitationCard from "./InvitationCard";
import ErrorBoundary from "~/components/ErrorBoundary";

interface PendingInvitationsProps {
  userId: string;
}

export default function PendingInvitations({ userId }: PendingInvitationsProps) {
  const [pendingInvitations, setPendingInvitations] = useState<MeetingInvitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvitations() {
      try {
        setError(null);
        setLoading(true);
        const invitations = await getPendingInvitations(userId);
        setPendingInvitations(invitations);
      } catch (error) {
        console.error('Error loading pending invitations:', error);
        if (isAppError(error)) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load pending invitations');
        }
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [userId]);

  const handleAcceptInvitation = async (invitation: MeetingInvitation) => {
    try {
      setError(null);
      await acceptMeetingInvitation(invitation.id, userId);
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (error) {
      console.error('Error accepting invitation:', error);
      if (isAppError(error)) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to accept invitation');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
      <ErrorBoundary>
        <div className="space-y-4">
          {pendingInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={handleAcceptInvitation}
            />
          ))}
        </div>
      </ErrorBoundary>
    </div>
  );
} 