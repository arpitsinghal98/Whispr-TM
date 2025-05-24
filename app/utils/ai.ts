// ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini API initialized');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini:', err);
  }
} else {
  console.error('⚠️ Missing VITE_GEMINI_API_KEY');
}

interface TranscriptSegment {
  text: string;
  timestamp: string;
  speaker?: string;
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  if (!genAI) throw new Error('AI features are disabled.');

  try {
    console.log(`🎤 Transcribing with model: gemini-1.5-flash`);
    console.log(`📦 Base64 length: ${audioBase64.length}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: "You are a speech-to-text transcription service. Transcribe the following audio exactly as spoken. If there is no speech, return nothing. Do not add any commentary or explanations." },
          {
            inlineData: {
              mimeType: "audio/webm;codecs=opus",
              data: audioBase64
            }
          }
        ]
      }]
    });

    const response = await result.response;
    const text = response.text();

    // Clean up the response
    const cleaned = text
      .replace(/^Here's.*?:/i, '')
      .replace(/^The transcription is:/i, '')
      .replace(/^The audio says:/i, '')
      .replace(/^I'm unable to transcribe.*$/i, '') // Remove error messages
      .replace(/^I don't have access.*$/i, '') // Remove access messages
      .replace(/^I need the audio.*$/i, '') // Remove need messages
      .trim();

    // If the cleaned text is empty or contains error messages, return empty string
    if (!cleaned || cleaned.toLowerCase().includes("unable to transcribe")) {
      return "";
    }

    console.log(`✅ Transcription from gemini-1.5-flash:`, cleaned);
    return cleaned;
  } catch (error: any) {
    if (error.message?.includes('400')) {
      throw new Error("Audio too long or in unsupported format.");
    }
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.warn(`⚠️ Quota hit, retrying later.`);
      return "";
    }
    console.error(`❌ Unknown error with gemini-1.5-flash:`, error);
    return "";
  }
}

export async function summarizeTranscriptChunk(text: string): Promise<string> {
  if (!genAI) return "AI unavailable.";

  const prompt = `Clean up and summarize this segment of a meeting transcript. \nPreserve natural flow, fix grammar, and remove any disfluencies. Don't fabricate. Just clean and present clearly:\n---\n${text}\n---`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = (await result.response).text().trim();

    return responseText || "No meaningful content found.";
  } catch (error) {
    console.error("❌ summarizeTranscriptChunk failed:", error);
    return "Failed to clean this segment.";
  }
}

export async function generateMeetingSummary(transcript: TranscriptSegment[]): Promise<string> {
  if (!genAI) return "AI unavailable.";

  const prompt = `Please summarize this meeting transcript:\n${transcript.map(seg => seg.text).join('\n')}\n\nFocus on:\n1. Main topics discussed\n2. Key decisions made\n3. Action items\n4. Summary in bullet points`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    console.error('❌ Summary generation failed:', error);
    return "Failed to generate summary.";
  }
}

export async function chatWithAI({ transcript, question }: { transcript: TranscriptSegment[], question: string }): Promise<string> {
  if (!genAI) throw new Error('AI service unavailable.');

  const formatted = transcript.map(seg => `[${new Date(seg.timestamp).toLocaleTimeString()}] ${seg.text}`).join('\n');

  const prompt = `You are an AI assistant for a meeting transcript.\n\nTranscript:\n${formatted}\n\nUser Question: ${question}\n\nGive a helpful answer based only on the transcript. If it's not present, say so.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    console.error('❌ chatWithAI failed:', error);
    return "Unable to answer the question.";
  }
}

export async function extractActionItems(transcript: TranscriptSegment[]): Promise<string[]> {
  if (!genAI) return ["AI unavailable."];

  const prompt = `Extract all action items from this transcript:\n${transcript.map(t => t.text).join('\n')}\n\nFormat each like:\n- Who is responsible\n- What needs to be done\n- When it is due (if mentioned)`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return (await result.response).text().split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('❌ Action item extraction failed:', error);
    return ["Failed to extract action items."];
  }
}

export async function generateMeetingInsights(transcript: TranscriptSegment[]): Promise<{
  sentiment: string;
  keyTopics: string[];
  decisions: string[];
}> {
  if (!genAI) {
    return {
      sentiment: "neutral",
      keyTopics: ["AI unavailable"],
      decisions: ["AI unavailable"]
    };
  }

  const prompt = `Analyze this meeting transcript and return a JSON object with the following structure:
{
  "sentiment": "positive|neutral|negative",
  "keyTopics": ["topic1", "topic2", ...],
  "decisions": ["decision1", "decision2", ...]
}

Transcript:
${transcript.map(seg => seg.text).join('\n')}

Return ONLY the JSON object, no other text.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40
      }
    });
    const result = await model.generateContent(prompt);
    const rawText = (await result.response).text();

    // Clean the response to ensure it's valid JSON
    const cleanedJson = rawText
      .replace(/```json|```/g, '') // Remove markdown code blocks
      .replace(/^[^{]*/, '') // Remove any text before the first {
      .replace(/[^}]*$/, '') // Remove any text after the last }
      .trim();

    try {
      const insights = JSON.parse(cleanedJson);
      
      // Validate the response structure
      if (!insights.sentiment || !Array.isArray(insights.keyTopics) || !Array.isArray(insights.decisions)) {
        throw new Error('Invalid response structure');
      }

      // Ensure sentiment is one of the allowed values
      if (!['positive', 'neutral', 'negative'].includes(insights.sentiment)) {
        insights.sentiment = 'neutral';
      }

      return insights;
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('Raw response:', rawText);
      console.log('Cleaned JSON:', cleanedJson);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('❌ Insight generation failed:', error);
    return {
      sentiment: "neutral",
      keyTopics: ["Could not analyze"],
      decisions: ["Could not analyze"]
    };
  }
}
