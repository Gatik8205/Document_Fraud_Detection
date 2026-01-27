export type DecisionType = "Low Risk" | "Suspicious" | "High Risk" | "Inconclusive";
export type ConfidenceType = "High" | "Medium" | "Low";

export interface FraudBreakdown {
  image: number;
  text: number;
  meta: number;
  elaHeatmap?: string;
  edgeMap?: string;
  cloneMap?: string;
}

export interface FraudResult {
  fraudScore: number;
  decision: DecisionType;
  confidence: ConfidenceType;
  breakdown: FraudBreakdown;
}
