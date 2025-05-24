import { db, collection, addDoc, query, where, getDocs, updateDoc, doc } from "~/utils/firestoreClient";

export interface MeetingInvitation {
  id: string;
  eventId: string;
  inviteeId: string;
  meetingTitle: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
  organizerId: string;
  inviteeEmail: string;
  updatedAt: string;
}

export async function createMeetingInvitation(
  eventId: string,
  organizerId: string,
  inviteeEmail: string
): Promise<string> {
  const invitationsRef = collection(db, "meeting_invitations");
  const invitationData: Omit<MeetingInvitation, 'id'> = {
    eventId,
    organizerId,
    inviteeEmail,
    inviteeId: '', // Will be updated when user accepts
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meetingTitle: '', // Will be populated from event data
  };

  const docRef = await addDoc(invitationsRef, invitationData);
  return docRef.id;
}

export async function acceptMeetingInvitation(
  invitationId: string,
  inviteeId: string
): Promise<void> {
  const invitationRef = doc(db, "meeting_invitations", invitationId);
  await updateDoc(invitationRef, {
    inviteeId,
    status: 'accepted',
    updatedAt: new Date().toISOString(),
  });
}

export async function declineMeetingInvitation(
  invitationId: string
): Promise<void> {
  const invitationRef = doc(db, "meeting_invitations", invitationId);
  await updateDoc(invitationRef, {
    status: 'declined',
    updatedAt: new Date().toISOString(),
  });
}

export async function getPendingInvitations(
  inviteeEmail: string
): Promise<MeetingInvitation[]> {
  const invitationsRef = collection(db, "meeting_invitations");
  const q = query(
    invitationsRef,
    where("inviteeEmail", "==", inviteeEmail),
    where("status", "==", "pending")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MeetingInvitation));
}

export async function getAcceptedInvitations(
  inviteeId: string
): Promise<MeetingInvitation[]> {
  const invitationsRef = collection(db, "meeting_invitations");
  const q = query(
    invitationsRef,
    where("inviteeId", "==", inviteeId),
    where("status", "==", "accepted")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MeetingInvitation));
} 