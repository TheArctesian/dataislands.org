import type { Company } from "./Company.ts";
import type { Evidence } from "./Evidence.ts";

export class ClaimOrigin {
  static readonly SecExhibit = new ClaimOrigin("sec_exhibit", 0, true);
  static readonly MergeReview = new ClaimOrigin("merge_review", 1, true);
  static readonly ParentReview = new ClaimOrigin("parent_review", 1, true);
  static readonly Literature = new ClaimOrigin("literature_review", 1, true);
  static readonly BrokerPage = new ClaimOrigin("broker_page_review", 1, true);
  /** A reader confirmed the filing a name match found, so it outranks that match on the same date. */
  static readonly GroupCheck = new ClaimOrigin("group_check", -1, true);
  static readonly FirstPass = new ClaimOrigin("first_pass_unverified", 2, false);
  static readonly SecNameMatch = new ClaimOrigin("sec_name_match_unverified", 3, false);

  readonly label: string;
  readonly rank: number;
  readonly isVerified: boolean;

  private constructor(label: string, rank: number, isVerified: boolean) {
    this.label = label;
    this.rank = rank;
    this.isVerified = isVerified;
  }
}

export type OwnershipType =
  | "public" | "subsidiary_of_public" | "private_equity" | "venture_backed"
  | "private_independent" | "subsidiary_of_private" | "nonprofit" | "government";

/** One source's statement about who owns one broker. */
export class OwnershipClaim {
  readonly brokerId: string;
  readonly origin: ClaimOrigin;
  readonly evidence: Evidence;
  readonly immediateParent: Company | null;
  readonly ultimateParent: Company | null;
  readonly ownershipType: OwnershipType | null;

  constructor(fields: {
    brokerId: string;
    origin: ClaimOrigin;
    evidence: Evidence;
    immediateParent?: Company | null;
    ultimateParent?: Company | null;
    ownershipType?: OwnershipType | null;
  }) {
    this.brokerId = fields.brokerId;
    this.origin = fields.origin;
    this.evidence = fields.evidence;
    this.immediateParent = fields.immediateParent ?? null;
    this.ultimateParent = fields.ultimateParent ?? null;
    this.ownershipType = fields.ownershipType ?? null;
  }

  get owner(): Company | null {
    return this.ultimateParent ?? this.immediateParent;
  }

  /** Sources may stop at different levels of one chain, so sharing any parent is agreement. */
  agreesWith(other: OwnershipClaim): boolean {
    const mine = [this.immediateParent, this.ultimateParent].flatMap((c) => (c ? [c.key] : []));
    return [other.immediateParent, other.ultimateParent].some((c) => c !== null && mine.includes(c.key));
  }

  /** Newest first. Dates that overlap or are missing fall back to how much the source is trusted. */
  static byPrecedence(left: OwnershipClaim, right: OwnershipClaim): number {
    const a = left.evidence.date;
    const b = right.evidence.date;
    if (a && !b) return -1;
    if (b && !a) return 1;
    if (a && b && a.isAfter(b)) return -1;
    if (a && b && b.isAfter(a)) return 1;
    return left.origin.rank - right.origin.rank;
  }

  toJSON() {
    return { owner: this.owner?.name ?? null, origin: this.origin.label, evidence: this.evidence };
  }
}
