import type { Broker } from "./Broker.ts";
import { ConfidenceScore } from "./ConfidenceScore.ts";
import type { MergeDecision } from "./MergeDecision.ts";
import { OwnershipClaim } from "./OwnershipClaim.ts";
import { Sourced } from "./Source.ts";
import { type CheckReason, OwnershipRecord, type RejectedClaim } from "./OwnershipRecord.ts";

/** Evidence ending before `staleBefore` needs rechecking, because companies get resold. */
export class OwnershipResolver {
  private readonly staleBefore: string;

  constructor(policy: { staleBefore: string }) {
    this.staleBefore = policy.staleBefore;
  }

  resolve(
    broker: Broker,
    claims: readonly OwnershipClaim[],
    rejected: readonly RejectedClaim[] = [],
    merge: MergeDecision | null = null,
    siteOperator: Sourced<string> | null = null,
  ): OwnershipRecord {
    const usable = claims.filter((c) => c.evidence.isUsable).sort(OwnershipClaim.byPrecedence);
    const named = usable.filter((c) => c.owner);
    const winner = named[0];
    const shared = { broker, rejected, merge, siteOperator };

    if (!winner) {
      const typed = usable.find((c) => c.ownershipType);
      if (!typed) return new OwnershipRecord({ ...shared, status: "unknown" });
      return new OwnershipRecord({
        ...shared,
        status: "needs_check",
        reasons: ["type_without_owner"],
        ownershipType: new Sourced(typed.ownershipType!, [typed.evidence.source]),
      });
    }

    const others = named.slice(1);
    const corroboratedBy = others.filter((c) => c.agreesWith(winner));
    const disagreeing = others.filter((c) => !c.agreesWith(winner));
    const superseded = disagreeing.filter((c) => this.isOlder(c, winner));
    const conflicts = disagreeing.filter((c) => !this.isOlder(c, winner));
    const typed = [winner, ...corroboratedBy].find((c) => c.ownershipType);
    const ownershipType = typed ? new Sourced(typed.ownershipType!, [typed.evidence.source]) : null;
    const reasons = this.reasonsToCheck(winner);

    return new OwnershipRecord({
      ...shared,
      status: conflicts.length ? "conflict" : reasons.length ? "needs_check" : "ready",
      reasons,
      confidenceScore: ConfidenceScore.of(winner.evidence, {
        staleBefore: this.staleBefore,
        unverifiedSource: !winner.origin.isVerified,
        corroborations: new Set(corroboratedBy.map((c) => c.evidence.source.id).filter((id) => id !== winner.evidence.source.id)).size,
        disputed: conflicts.length > 0,
      }),
      winner,
      ownershipType,
      conflicts,
      superseded,
      corroboratedBy,
    });
  }

  private isOlder(claim: OwnershipClaim, winner: OwnershipClaim): boolean {
    const date = claim.evidence.date;
    return date !== null && winner.evidence.date !== null && winner.evidence.date.isAfter(date);
  }

  private reasonsToCheck(winner: OwnershipClaim): CheckReason[] {
    const { evidence, origin } = winner;
    const reasons: CheckReason[] = [];
    if (!origin.isVerified) reasons.push("unverified_source");
    if (evidence.confidence !== "high") reasons.push("medium_confidence");
    if (!evidence.date) reasons.push("undated_evidence");
    else if (evidence.date.endsBefore(this.staleBefore)) reasons.push("stale_evidence");
    return reasons;
  }
}
