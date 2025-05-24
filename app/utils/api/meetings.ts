import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "~/utils/firestoreClient";
import type { MeetingData } from "~/types/meeting";

export async function fetchMeetingDetails(
  eventId: string,
  userId: string
): Promise<MeetingData | null> {
  // First check if there's an existing meeting
  const meetingRef = doc(db, "meetings", eventId);
  const meetingSnap = await getDoc(meetingRef);

  if (meetingSnap.exists()) {
    return meetingSnap.data() as MeetingData;
  }

  // If no meeting exists, check if user is invited
  const invitationsRef = collection(db, "meeting_invitations");
  const q = query(
    invitationsRef,
    where("eventId", "==", eventId),
    where("inviteeId", "==", userId)
  );
  const invitationSnap = await getDocs(q);

  if (!invitationSnap.empty) {
    // User is invited, create a new meeting record
    const meetingData: MeetingData = {
      id: eventId,
      userId: userId,
      status: "invited",
      createdAt: new Date().toISOString(),
      transcript: [],
      notes: "",
      summary: "",
      actionItems: [],
    };
    await setDoc(meetingRef, meetingData);
    return meetingData;
  }

  return null;
}

export async function updateMeetingData(
  eventId: string,
  data: Partial<MeetingData>
): Promise<void> {
  const meetingRef = doc(db, "meetings", eventId);
  await setDoc(meetingRef, data, { merge: true });
}

export async function getMeetingTranscript(
  eventId: string
): Promise<MeetingData["transcript"]> {
  const meetingRef = doc(db, "meetings", eventId);
  const meetingSnap = await getDoc(meetingRef);

  if (meetingSnap.exists()) {
    const data = meetingSnap.data() as MeetingData;
    return data.transcript || [];
  }

  return [];
}
