import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { audioBase64, mimeType } = req.body;

    const model = "gemini-3-flash-preview";
    const systemInstruction = `You are an expert English oral practice assistant.
Your task is to transcribe English audio with 100% precision and provide deep linguistic analysis.
CORE OBJECTIVES:
1. FULL SENTENCE COVERAGE: The 'startTime' and 'endTime' for each sentence must be generous enough to ensure the user hears the complete sentence without any clipping at the edges. Add a tiny buffer (0.1-0.2s) if necessary.
2. COMPREHENSIVE WORD DATA: You MUST return IPA, Chinese meaning, and a usage example for EVERY word in the transcription. No exclusions.
3. RELAXED SEGMENTATION: Do not split sentences too aggressively. Keep complete thoughts together.
For each sentence:
- Transcribe the text exactly as spoken.
- Provide startTime and endTime in seconds.
- For EVERY word:
  - word: String
  - ipa: Standard IPA
  - meaning: Clear Chinese Simplified meaning.
  - example: A short English example sentence using this word.
Return the result strictly in JSON matching the schema.`;

    const prompt = "Please analyze this English oral recording. Transcribe it, split into sentences with start/end times, and provide word-level IPA and Chinese meanings.";

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { inlineData: { data: audioBase64, mimeType } },
            { text: prompt }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullText: { type: Type.STRING },
            sentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  startTime: { type: Type.NUMBER },
                  endTime: { type: Type.NUMBER },
                  words: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING },
                        ipa: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                        example: { type: Type.STRING }
                      },
                      required: ["word", "ipa", "meaning", "example"]
                    }
                  }
                },
                required: ["text", "startTime", "endTime", "words"]
              }
            }
          },
          required: ["fullText", "sentences"]
        }
      }
    });

    if (!response.text) {
      return res.status(500).json({ error: "Failed to get analysis from Gemini" });
    }

    return res.status(200).json(JSON.parse(response.text));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}