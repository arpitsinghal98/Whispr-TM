import { transcribeAudio } from "~/utils/ai";

interface TranscriptionSegment {
  text: string;
  timestamp: string;
}

class AudioTranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private displayStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private isRecording: boolean = false;
  private onTranscriptionUpdate: (segments: TranscriptionSegment[]) => void;
  private recordingTimer: NodeJS.Timeout | null = null;
  private transcriptBuffer: string[] = [];

  constructor(onTranscriptionUpdate: (segments: TranscriptionSegment[]) => void) {
    this.onTranscriptionUpdate = onTranscriptionUpdate;
  }

  private getSupportedMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/aac",
      "audio/wav",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    throw new Error("No supported audio format found.");
  }

  private async checkBrowserSupport(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Browser doesn't support getUserMedia.");
    if (!window.MediaRecorder) throw new Error("MediaRecorder API not supported.");
  }

  async startRecording(): Promise<void> {
    try {
      await this.checkBrowserSupport();

      // Get display stream first
      this.displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      
      // Get microphone stream
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      
      // Connect both streams to the destination
      audioContext.createMediaStreamSource(this.displayStream).connect(destination);
      audioContext.createMediaStreamSource(this.micStream).connect(destination);

      this.stream = destination.stream;
      this.isRecording = true;

      this.startNewRecorder(); // Start initial chunk recorder
    } catch (err) {
      console.error("❌ Failed to start recording:", err);
      this.stopRecording();
      throw err;
    }
  }

  private startNewRecorder() {
    if (!this.stream) return;

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: this.getSupportedMimeType(),
      audioBitsPerSecond: 128000,
    });

    const chunks: Blob[] = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    this.mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: this.getSupportedMimeType() });

      if (blob.size < 8000) {
        console.warn("⚠️ Skipping chunk: too small (likely silence)");
        return;
      }

      const base64 = await this.blobToBase64(blob);
      console.log("🧪 Sending to Gemini", {
        base64Length: base64.length,
        preview: base64.slice(0, 100),
      });

      try {
        const transcription = await transcribeAudio(base64);
        if (transcription && transcription.trim()) {
          this.transcriptBuffer.push(transcription);

          this.onTranscriptionUpdate([
            {
              text: this.transcriptBuffer.join(" "),
              timestamp: new Date().toISOString(),
            },
          ]);

          this.transcriptBuffer = [];
        }
      } catch (err) {
        console.error("❌ Transcription failed:", err);
      }

      if (this.isRecording) {
        this.startNewRecorder(); // Continue recording next chunk
      }
    };

    this.mediaRecorder.start();
    this.recordingTimer = setTimeout(() => {
      this.mediaRecorder?.stop(); // Stop after 6s
    }, 6000);
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  stopRecording(): void {
    this.isRecording = false;

    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
    }

    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    // Stop display stream first
    if (this.displayStream) {
      this.displayStream.getTracks().forEach(track => {
        track.stop();
      });
      this.displayStream = null;
    }

    // Stop microphone stream
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => {
        track.stop();
      });
      this.micStream = null;
    }

    // Stop the combined stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    this.mediaRecorder = null;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

export default AudioTranscriptionService;
