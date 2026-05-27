export interface WordInfo {
  word: string;
  ipa: string;
  meaning: string;
  example?: string;
}

export interface SentenceAnalysis {
  text: string;
  startTime: number;
  endTime: number;
  words: WordInfo[];
}

export interface OralAnalysisResult {
  fullText: string;
  sentences: SentenceAnalysis[];
}

export async function analyzeOralAudio(audioBase64: string, mimeType: string): Promise<OralAnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, mimeType })
  });

  if (!response.ok) {
    throw new Error("Failed to get analysis from Gemini");
  }

  return (await response.json()) as OralAnalysisResult;
}