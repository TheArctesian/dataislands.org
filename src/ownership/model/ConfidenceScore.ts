import type { Evidence } from "./Evidence.ts";

export interface ScoreFactor {
  factor: string;
  delta: number;
}

const BASE = { high: 0.8, medium: 0.55, low: 0.25, none: 0 } as const;
const PRIMARY_KINDS: ReadonlySet<string> = new Set(["sec_filing", "government_registry", "government_report", "state_record"]);
const PER_CORROBORATION = 0.05;
const MAX_CORROBORATION = 0.1;
const DISPUTE_CAP = 0.3;

/**
 * A 0 to 1 ranking of how well a statement is supported, showing how it was reached.
 * It is not a probability, and publishing still depends on the record's status.
 */
export class ConfidenceScore {
  readonly value: number;
  readonly factors: readonly ScoreFactor[];

  private constructor(value: number, factors: ScoreFactor[]) {
    this.value = value;
    this.factors = factors;
  }

  static of(evidence: Evidence, context: {
    staleBefore: string;
    unverifiedSource?: boolean;
    corroborations?: number;
    disputed?: boolean;
  }): ConfidenceScore {
    const factors: ScoreFactor[] = [{ factor: `evidence_${evidence.confidence}`, delta: BASE[evidence.confidence] }];
    if (PRIMARY_KINDS.has(evidence.source.kind)) factors.push({ factor: "primary_source", delta: 0.05 });
    if (!evidence.opened) factors.push({ factor: "source_not_opened", delta: -0.2 });
    if (!evidence.date) factors.push({ factor: "undated", delta: -0.1 });
    else if (evidence.date.endsBefore(context.staleBefore)) factors.push({ factor: "stale", delta: -0.15 });
    if (context.unverifiedSource) factors.push({ factor: "unverified_source", delta: -0.1 });
    const corroborations = context.corroborations ?? 0;
    if (corroborations) factors.push({ factor: "corroborated", delta: Math.min(corroborations * PER_CORROBORATION, MAX_CORROBORATION) });

    const total = factors.reduce((sum, f) => sum + f.delta, 0);
    const clamped = Math.max(0, Math.min(1, total));
    if (context.disputed) factors.push({ factor: "disputed_cap", delta: Math.min(0, DISPUTE_CAP - clamped) });
    return new ConfidenceScore(Math.round(Math.min(clamped, context.disputed ? DISPUTE_CAP : 1) * 100) / 100, factors);
  }

  toJSON() {
    return { value: this.value, factors: this.factors };
  }
}
