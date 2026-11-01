import type { Broker } from "./Broker.ts";
import type { Company } from "./Company.ts";
import type { ConfidenceScore } from "./ConfidenceScore.ts";
import type { MergeDecision } from "./MergeDecision.ts";
import type { OwnershipClaim, OwnershipType } from "./OwnershipClaim.ts";
import type { Source, Sourced } from "./Source.ts";

export type OwnershipStatus = "ready" | "needs_check" | "conflict" | "unknown";
export type CheckReason =
  | "medium_confidence" | "stale_evidence" | "undated_evidence" | "unverified_source" | "type_without_owner";

export class RejectedClaim {
  readonly claim: OwnershipClaim;
  readonly reason: string;
  readonly reasonSource: Source;

  constructor(claim: OwnershipClaim, reason: string, reasonSource: Source) {
    this.claim = claim;
    this.reason = reason;
    this.reasonSource = reasonSource;
  }

  toJSON() {
    return { ...this.claim.toJSON(), reason: this.reason, reasonSource: this.reasonSource.id };
  }
}

/** The atlas's current answer for one broker, with everything that was weighed to reach it. */
export class OwnershipRecord {
  readonly broker: Broker;
  readonly status: OwnershipStatus;
  readonly reasons: readonly CheckReason[];
  readonly winner: OwnershipClaim | null;
  readonly ownershipType: Sourced<OwnershipType> | null;
  readonly conflicts: readonly OwnershipClaim[];
  readonly superseded: readonly OwnershipClaim[];
  readonly corroboratedBy: readonly OwnershipClaim[];
  readonly rejected: readonly RejectedClaim[];
  readonly merge: MergeDecision | null;
  readonly siteOperator: Sourced<string> | null;
  readonly confidenceScore: ConfidenceScore | null;

  constructor(fields: {
    broker: Broker;
    status: OwnershipStatus;
    reasons?: readonly CheckReason[];
    winner?: OwnershipClaim | null;
    ownershipType?: Sourced<OwnershipType> | null;
    conflicts?: readonly OwnershipClaim[];
    superseded?: readonly OwnershipClaim[];
    corroboratedBy?: readonly OwnershipClaim[];
    rejected?: readonly RejectedClaim[];
    merge?: MergeDecision | null;
    siteOperator?: Sourced<string> | null;
    confidenceScore?: ConfidenceScore | null;
  }) {
    this.broker = fields.broker;
    this.status = fields.status;
    this.reasons = fields.reasons ?? [];
    this.winner = fields.winner ?? null;
    this.ownershipType = fields.ownershipType ?? null;
    this.conflicts = fields.conflicts ?? [];
    this.superseded = fields.superseded ?? [];
    this.corroboratedBy = fields.corroboratedBy ?? [];
    this.rejected = fields.rejected ?? [];
    this.merge = fields.merge ?? null;
    this.siteOperator = fields.siteOperator ?? null;
    this.confidenceScore = fields.confidenceScore ?? null;
  }

  get owner(): Company | null {
    return this.winner?.owner ?? null;
  }

  /** The broker is the owner the source named. Investors above it may simply be unresearched. */
  get isNamedOwner(): boolean {
    return this.owner !== null && this.broker.isKnownAs(this.owner);
  }

  /** Everything supporting the current answer: the winning claim and those that agree with it. */
  get sourceIds(): string[] {
    const claims = this.winner ? [this.winner, ...this.corroboratedBy] : [];
    const ids = [...claims.map((c) => c.evidence.source.id), ...(this.ownershipType?.sources.map((s) => s.id) ?? [])];
    return [...new Set(ids)].sort();
  }

  toJSON() {
    return {
      brokerId: this.broker.id,
      broker: this.broker.name.value,
      inUsScope: this.broker.inUsScope,
      status: this.status,
      reasons: this.reasons,
      confidenceScore: this.confidenceScore,
      isNamedOwner: this.isNamedOwner,
      owner: this.owner,
      immediateParent: this.winner?.immediateParent ?? null,
      ownershipType: this.ownershipType,
      origin: this.winner?.origin.label ?? null,
      sources: this.sourceIds,
      evidence: this.winner?.evidence ?? null,
      corroborations: this.corroboratedBy.length,
      siteOperator: this.siteOperator,
      merge: this.merge,
      conflicts: this.conflicts,
      superseded: this.superseded,
      rejected: this.rejected,
    };
  }
}
