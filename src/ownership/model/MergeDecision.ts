import type { Evidence } from "./Evidence.ts";

export type MergeVerdict = "one_company" | "corporate_family" | "wrong_merge" | "unresolved";

/** The reviewed answer to whether the names and domains in one census record belong together. */
export class MergeDecision {
  readonly item: string;
  readonly brokerId: string;
  readonly verdict: MergeVerdict;
  readonly evidence: Evidence | null;
  readonly splitInto: readonly string[];
  readonly unconfirmedMembers: readonly string[];

  constructor(fields: {
    item: string;
    brokerId: string;
    verdict: MergeVerdict;
    evidence: Evidence | null;
    splitInto?: readonly string[];
    unconfirmedMembers?: readonly string[];
  }) {
    if (!fields.evidence && fields.verdict !== "unresolved") throw new Error(`no source for merge ${fields.item}`);
    this.item = fields.item;
    this.brokerId = fields.brokerId;
    this.verdict = fields.verdict;
    this.evidence = fields.evidence;
    this.splitInto = fields.splitInto ?? [];
    this.unconfirmedMembers = fields.unconfirmedMembers ?? [];
  }

  toJSON() {
    return {
      item: this.item,
      verdict: this.verdict,
      splitInto: this.splitInto,
      unconfirmedMembers: this.unconfirmedMembers,
      evidence: this.evidence,
    };
  }
}
