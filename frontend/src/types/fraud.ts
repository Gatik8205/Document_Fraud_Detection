export type DecisionType = "Low Risk" | "Suspicious" | "High Risk" | "Inconclusive";
export type ConfidenceType = "High" | "Medium" | "Low";

export interface FraudResult {
  fraudScore: number;
  decision: string;
  confidence: string;
  flaggedPage?: number;   // ← ADD
  totalPages?: number;    // ← ADD
  breakdown: FraudBreakdown;
}

export interface FraudBreakdown {
  image: number;
  text: number;
  meta: number;
  elaHeatmap?: string;
  edgeMap?: string;
  cloneMap?: string;
  gradcamMap?: string;    // ← ADD
}