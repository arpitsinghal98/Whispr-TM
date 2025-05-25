import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  onSnapshot,
} from "~/utils/firestoreClient";
import { Timestamp, limit } from "firebase/firestore";
import type { CalendarEvent, MeetingData } from "~/types/meeting";
import type { Meeting } from "~/types/schema";
import { Summary, TranscriptSegment } from "~/types/schema";
import { generateSummaryWithInsights } from "../ai";

// ✅ MEETING METADATA
export async function fetchMeetingDetails(
  eventId: string,
  userId: string
): Promise<MeetingData | null> {
  const meetingRef = doc(db, "meetings", eventId);
  const meetingSnap = await getDoc(meetingRef);

  if (meetingSnap.exists()) {
    const meetingData = meetingSnap.data() as MeetingData;
    // Initialize empty arrays since transcript, summary, and chat are in separate collections
    return {
      ...meetingData,
      transcript: [],
      summary: "",
      actionItems: [],
      chat: [],
    };
  }

  const invitationsRef = collection(db, "meeting_invitations");
  const q = query(
    invitationsRef,
    where("eventId", "==", eventId),
    where("inviteeId", "==", userId)
  );
  const invitationSnap = await getDocs(q);

  if (!invitationSnap.empty) {
    const meetingData: MeetingData = {
      id: eventId,
      userId,
      status: "invited",
      createdAt: new Date().toISOString(),
      transcript: [],
      notes: "",
      summary: "",
      actionItems: [],
      chat: [],
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

export const saveTranscriptToFirestore = async (
  newTranscript: TranscriptSegment[],
  meetingId: string,
  isComplete: boolean = false
) => {
  if (!meetingId || typeof meetingId !== "string" || meetingId.length < 5) {
    console.warn("⚠️ Invalid or missing meetingId. Skipping transcript save.");
    return;
  }

  try {
    console.log("📤 Saving transcript in /transcripts/" + meetingId);

    // Get the current transcript first
    const transcriptRef = doc(db, "transcripts", meetingId);
    const currentDoc = await getDoc(transcriptRef);
    const currentData = currentDoc.exists()
      ? currentDoc.data()
      : { transcript: [] };
    const currentTranscript = currentData.transcript || [];

    // Merge new transcript with existing one
    const updatedTranscript = [...currentTranscript, ...newTranscript];

    // Save to transcripts collection
    await setDoc(
      transcriptRef,
      {
        meetingId,
        transcript: updatedTranscript,
        lastUpdated: new Date().toISOString(),
        isComplete,
      },
      { merge: true }
    );

    console.log("✅ Transcript updated in /transcripts/{id}");

    // Only generate summary if the transcript is complete
    if (isComplete) {
      await generateSummaryWithInsights(updatedTranscript, meetingId)
        .then(() => console.log("✅ Summary generated"))
        .catch(() => console.warn("⚠️ Failed to generate summary"));
    }
  } catch (error) {
    console.error("❌ Error saving transcript:", error);
    throw new Error("Failed to save transcript");
  }
};

// Add a new function to subscribe to transcript updates
export const subscribeToTranscript = (
  meetingId: string,
  onUpdate: (transcript: TranscriptSegment[]) => void
) => {
  if (!meetingId || typeof meetingId !== "string" || meetingId.length < 5) {
    console.warn(
      "⚠️ Invalid or missing meetingId. Skipping transcript subscription."
    );
    return () => {};
  }

  console.log("🎧 Subscribing to transcript updates for meeting:", meetingId);
  const transcriptRef = doc(db, "transcripts", meetingId);

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    transcriptRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log("data of snapshot live -> ", data);
        onUpdate(data.transcript || []);
      } else {
        onUpdate([]);
      }
    },
    (error: Error) => {
      console.error("❌ Error in transcript subscription:", error);
    }
  );

  return unsubscribe;
};

export async function getTranscriptForMeeting(
  meetingId: string
): Promise<TranscriptSegment[]> {
  if (!meetingId || typeof meetingId !== "string" || meetingId.length < 5) {
    console.warn("⚠️ Invalid or missing meetingId. Skipping transcript fetch.");
    return [];
  }

  try {
    // Get from transcripts collection
    const transcriptRef = doc(db, "transcripts", meetingId);
    const transcriptSnap = await getDoc(transcriptRef);

    if (transcriptSnap.exists()) {
      const data = transcriptSnap.data();
      return data.transcript || [];
    } else {
      console.warn("⚠️ No transcript found for meeting ID:", meetingId);
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching transcript:", error);
    return [];
  }
}

export const saveSummaryToFirestore = async (
  meetingId: string,
  summary: Summary
) => {
  if (!meetingId || typeof meetingId !== "string" || meetingId.length < 5) {
    console.error("❌ saveSummaryToFirestore: Invalid or missing meetingId");
    return;
  }

  try {
    const existingSummary = await getSummaryForMeeting(meetingId);
    if (
      existingSummary &&
      !existingSummary.summary.startsWith("Please provide")
    ) {
      console.log("✅ Valid summary already exists, skipping save");
      return;
    }

    if (summary.summary.startsWith("Please provide")) {
      console.warn("⚠️ Skipping invalid summary");
      return;
    }

    console.log("📤 Saving summary in /summaries/" + meetingId);

    // Save to summaries collection
    const summaryRef = doc(db, "summaries", meetingId);
    await setDoc(
      summaryRef,
      {
        meetingId,
        summary: summary.summary,
        actionItems: summary.actionItems,
        insights: summary.insights,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("✅ Summary saved in /summaries/{id}");
  } catch (error) {
    console.error("❌ Error saving summary:", error);
    throw new Error("Failed to save summary");
  }
};

export async function getSummaryForMeeting(
  meetingId: string | null
): Promise<Summary | null> {
  if (!meetingId || typeof meetingId !== "string" || meetingId.length < 5) {
    console.warn("⚠️ Invalid or missing meetingId. Skipping summary fetch.");
    return null;
  }

  try {
    // Get from summaries collection
    const summaryRef = doc(db, "summaries", meetingId);
    const summarySnap = await getDoc(summaryRef);

    if (summarySnap.exists()) {
      const data = summarySnap.data();
      if (data.summary) {
        return {
          summary: data.summary,
          actionItems: data.actionItems || [],
          insights: data.insights || null,
          id: meetingId,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching summary:", error);
    return null;
  }
}

export const saveMeetingToFirestore = async (
  meetingData: CalendarEvent[]
): Promise<string[]> => {
  try {
    const savedMeetingIds: string[] = [];

    for (const event of meetingData) {
      const meetingRef = doc(db, "meetings", event.id);
      const meetingSnap = await getDoc(meetingRef);

      if (meetingSnap.exists()) {
        console.log(`Meeting with ID ${event.id} already exists, skipping...`);
        continue;
      }

      const meeting = {
        ...event,
        id: event.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(meetingRef, meeting);
      savedMeetingIds.push(event.id);
      console.log("✅ Meeting saved with ID:", event.id);
    }

    return savedMeetingIds;
  } catch (error) {
    console.error("❌ Error saving meetings:", error);
    throw new Error("Failed to save meetings");
  }
};

export const retrieveAllMeetings = async (): Promise<CalendarEvent[]> => {
  try {
    const meetingsRef = collection(db, "meetings");
    const snapshot = await getDocs(meetingsRef);

    const meetings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CalendarEvent[];

    return meetings.sort((a, b) => {
      const dateA = a.start?.dateTime
        ? new Date(a.start.dateTime)
        : new Date(0);
      const dateB = b.start?.dateTime
        ? new Date(b.start.dateTime)
        : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("❌ Error retrieving meetings:", error);
    throw new Error("Failed to retrieve meetings");
  }
};

export const formatEventTime = (dateTime?: string): string => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export async function getMeetingData(eventId: string): Promise<MeetingData> {
  try {
    const docRef = doc(db, "meetings", eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as MeetingData;
    } else {
      throw new Error(`Meeting with ID "${eventId}" not found.`);
    }
  } catch (error) {
    console.error("❌ Error fetching meeting data:", error);
    throw error;
  }
}

export const saveChatToFirestore = async (
  meetingId: string,
  chat: Array<{ q: string; a: string }>
) => {
  if (!meetingId || typeof meetingId !== "string" || meetingId.length < 5) {
    console.warn("⚠️ Invalid or missing meetingId. Skipping chat save.");
    return;
  }

  try {
    console.log("📤 Saving chat in /chats/" + meetingId);

    const chatRef = doc(db, "chats", meetingId);
    await setDoc(
      chatRef,
      {
        meetingId,
        chat,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("✅ Chat saved in /chats/{id}");
  } catch (error) {
    console.error("❌ Error saving chat:", error);
    throw new Error("Failed to save chat");
  }
};

export async function getChatForMeeting(
  meetingId: string
): Promise<Array<{ q: string; a: string }>> {
  if (!meetingId || typeof meetingId !== "string" || meetingId.length < 5) {
    console.warn("⚠️ Invalid or missing meetingId. Skipping chat fetch.");
    return [];
  }

  try {
    const chatRef = doc(db, "chats", meetingId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      const data = chatSnap.data();
      return data.chat || [];
    } else {
      console.warn("⚠️ No chat found for meeting ID:", meetingId);
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching chat:", error);
    return [];
  }
}
