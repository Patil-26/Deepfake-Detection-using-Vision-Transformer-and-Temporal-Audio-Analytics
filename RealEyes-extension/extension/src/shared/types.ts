// Shared TypeScript types for DeepGuard extension

export interface AnalysisResult {
  success: boolean;
  type: "image" | "video_frame" | "video_frames" | "audio";
  label: "FAKE" | "REAL";
  confidence: number; // 0–100
  scores: {
    FAKE: number;
    REAL: number;
  };
  details: {
    risk_level: string;
    analysis_points: string[];
    model: string;
  };
}

export type MessageType =
  | "SCANNER_ON"
  | "SCANNER_OFF"
  | "START_REGION_SELECT"
  | "START_AUDIO_RECORD"
  | "ANALYZE_IMAGE_URL"
  | "ANALYZE_AUDIO"
  | "ANALYSIS_RESULT"
  | "ANALYSIS_ERROR";

export interface ChromeMessage {
  type: MessageType;
  payload?: unknown;
}
