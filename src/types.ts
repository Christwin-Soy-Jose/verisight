export type MediaType = 'image' | 'video' | 'audio';

export type ForensicToolMode =
  | 'original'
  | 'ela'
  | 'heatmap'
  | 'artifacts'
  | 'landmarks'
  | 'inspector';

export type VerificationVerdict =
  | 'AI_GENERATED'
  | 'MANIPULATED_OR_SPLICED'
  | 'SUSPICIOUS_ANOMALIES'
  | 'HIGH_CONFIDENCE_AUTHENTIC';

export interface ForensicIndicator {
  category: 'Lighting & Shadows' | 'Facial & Anatomy' | 'Noise & Sensor' | 'Edge & Splicing' | 'Metadata & Provenance' | string;
  status: 'ANOMALY_DETECTED' | 'INCONSISTENT' | 'CLEAN';
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL';
  details: string;
}

export interface VerificationResult {
  id: string;
  mediaId: string;
  mediaName: string;
  mediaType: MediaType;
  timestamp: string;
  verdict: VerificationVerdict;
  verdictTitle: string;
  confidenceScore: number; // 0 - 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  summary: string;
  anomalyCount: number;
  indicators: ForensicIndicator[];
  technicalDeepDive: {
    photometricAnalysis: string;
    anatomicalCoherence: string;
    sensorNoisePattern: string;
    compressionSignatures: string;
  };
  reverseSearchKeywords: string[];
  investigatorActionPlan: string[];
  metadata: Record<string, string | number | boolean>;
  clientForensics: {
    elaMeanVariance: number;
    noiseStandardDeviation: number;
    compressionBlockiness: number;
    resolution: string;
    format: string;
    audioMetrics?: {
      spectralFlatness: number;
      zeroCrossingRate: number;
      spliceJumps: number;
      vocoderLikelihood: number;
    };
    videoMetrics?: {
      averageFrameVariance: number;
      jumpCutsDetected: number;
      temporalJitterScore: number;
    };
  };
  citations: Citation[];
  analystNotes?: string;
  sha256Hash: string;
}

export interface Citation {
  id: string;
  url: string;
  title: string;
  sourceName: string;
  notes: string;
  verifiedDate: string;
}

export interface AnomalyPin {
  time: number; // in seconds
  label: string;
  confidence: number;
  type: 'lighting' | 'splice' | 'glitch' | 'audio_jump';
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  duration?: number;
  mimeType: string;
  base64?: string;
  createdAt: string;
  sha256?: string;
  isPreset?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PixelSample {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  hex: string;
  luminance: number;
  hsv: string;
}
