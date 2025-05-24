import { useState, useEffect } from "react";
import { NoteItem, MeetingNote, NotesManager } from "~/firestoredb/NotesManager";
import { Timestamp } from "firebase/firestore";

interface MeetingNotesProps {
  meetingId: string;
  userId: string;
}

export default function MeetingNotes({ meetingId, userId }: MeetingNotesProps) {
  const [meetingNote, setMeetingNote] = useState<MeetingNote | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, [meetingId]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await NotesManager.getNotesByMeetingId(meetingId);
      setMeetingNote(fetchedNotes);
      setError(null);
    } catch (err) {
      setError("Failed to load notes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      const updatedMeetingNote = await NotesManager.addNote(
        meetingId,
        userId,
        newNoteContent.trim()
      );
      setMeetingNote(updatedMeetingNote);
      setNewNoteContent("");
      setError(null);
    } catch (err) {
      setError("Failed to add note");
      console.error(err);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;

    try {
      await NotesManager.updateNote(meetingId, noteId, editingContent.trim());
      if (meetingNote) {
        const updatedNotes = meetingNote.notes.map(note =>
          note.id === noteId
            ? { ...note, content: editingContent.trim(), updatedAt: Timestamp.now() }
            : note
        );
        setMeetingNote({ ...meetingNote, notes: updatedNotes });
      }
      setEditingNoteId(null);
      setEditingContent("");
      setError(null);
    } catch (err) {
      setError("Failed to update note");
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await NotesManager.deleteNote(meetingId, noteId);
      if (meetingNote) {
        const updatedNotes = meetingNote.notes.filter(note => note.id !== noteId);
        if (updatedNotes.length === 0) {
          setMeetingNote(null);
        } else {
          setMeetingNote({ ...meetingNote, notes: updatedNotes });
        }
      }
      setError(null);
    } catch (err) {
      setError("Failed to delete note");
      console.error(err);
    }
  };

  const startEditing = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B3576]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add a new note..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4B3576] focus:border-transparent resize-none"
          rows={3}
        />
        <button
          onClick={handleAddNote}
          disabled={!newNoteContent.trim()}
          className="mt-2 px-4 py-2 bg-[#4B3576] text-white rounded-lg hover:bg-[#4B3576]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {meetingNote?.notes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-4">
            {editingNoteId === note.id ? (
              <div>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4B3576] focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleUpdateNote(note.id)}
                    className="px-3 py-1 bg-[#4B3576] text-white rounded-lg hover:bg-[#4B3576]/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {note.updatedAt.toDate().toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(note)}
                      className="text-[#4B3576] hover:text-[#4B3576]/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 