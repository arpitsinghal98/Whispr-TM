import { db } from "~/utils/firebaseClient";
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

export interface NoteItem {
  id: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MeetingNote {
  id?: string;
  meetingId: string;
  userId: string;
  notes: NoteItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class NotesManager {
  private static readonly COLLECTION_NAME = "notes";

  static async addNote(meetingId: string, userId: string, content: string): Promise<MeetingNote> {
    try {
      // First, try to get existing notes document for this meeting
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("meetingId", "==", meetingId)
      );
      
      const querySnapshot = await getDocs(q);
      const now = Timestamp.now();
      const newNoteItem: NoteItem = {
        id: crypto.randomUUID(),
        content,
        createdAt: now,
        updatedAt: now
      };

      if (querySnapshot.empty) {
        // If no document exists, create a new one
        const newMeetingNote: Omit<MeetingNote, "id"> = {
          meetingId,
          userId,
          notes: [newNoteItem],
          createdAt: now,
          updatedAt: now
        };
        
        const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newMeetingNote);
        return { id: docRef.id, ...newMeetingNote };
      } else {
        // If document exists, add the new note to the array
        const existingDoc = querySnapshot.docs[0];
        const noteRef = doc(db, this.COLLECTION_NAME, existingDoc.id);
        const existingData = existingDoc.data() as MeetingNote;
        
        await updateDoc(noteRef, {
          notes: [...existingData.notes, newNoteItem],
          updatedAt: now
        });

        return {
          id: existingDoc.id,
          ...existingData,
          notes: [...existingData.notes, newNoteItem],
          updatedAt: now
        };
      }
    } catch (error) {
      console.error("Error adding note:", error);
      throw error;
    }
  }

  static async getNotesByMeetingId(meetingId: string): Promise<MeetingNote | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("meetingId", "==", meetingId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as MeetingNote;
    } catch (error) {
      console.error("Error getting notes:", error);
      throw error;
    }
  }

  static async updateNote(meetingId: string, noteId: string, content: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("meetingId", "==", meetingId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const noteRef = doc.ref;
        const data = doc.data() as MeetingNote;
        
        const updatedNotes = data.notes.map(note => 
          note.id === noteId 
            ? { ...note, content, updatedAt: Timestamp.now() }
            : note
        );

        await updateDoc(noteRef, {
          notes: updatedNotes,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  }

  static async deleteNote(meetingId: string, noteId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("meetingId", "==", meetingId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const noteRef = doc.ref;
        const data = doc.data() as MeetingNote;
        
        const updatedNotes = data.notes.filter(note => note.id !== noteId);

        if (updatedNotes.length === 0) {
          // If no notes left, delete the entire document
          await deleteDoc(noteRef);
        } else {
          // Otherwise, update the document with remaining notes
          await updateDoc(noteRef, {
            notes: updatedNotes,
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }
} 