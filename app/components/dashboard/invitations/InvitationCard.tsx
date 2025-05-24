import type { MeetingInvitation } from "~/utils/meetingInvitations";

interface InvitationCardProps {
  invitation: MeetingInvitation;
  onAccept: (invitation: MeetingInvitation) => void;
}

export default function InvitationCard({ invitation, onAccept }: InvitationCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold">{invitation.meetingTitle}</h3>
      <p className="text-gray-600">{new Date(invitation.createdAt).toLocaleString()}</p>
      <button
        onClick={() => onAccept(invitation)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onAccept(invitation);
          }
        }}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Accept Invitation
      </button>
    </div>
  );
} 