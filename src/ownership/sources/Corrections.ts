import { readFileSync } from "node:fs";
import { Company } from "../model/Company.ts";
import type { Confidence } from "../model/Evidence.ts";
import type { OwnershipClaim } from "../model/OwnershipClaim.ts";

export interface MergeOwner {
  brokerId: string;
  owner: string;
  confidence?: Confidence;
}

export interface MergeCorrection {
  brokerId?: string;
  owners?: MergeOwner[];
  splitInto?: string[];
  unconfirmedMembers?: string[];
}

export interface Rejection {
  brokerId: string;
  owner: string;
  reason: string;
  sourceUrl: string;
}

interface CorrectionsFile {
  brokerIds: Record<string, string>;
  brokerNames: Record<string, string>;
  companyNames: Record<string, string>;
  merges: Record<string, MergeCorrection>;
  rejectedClaims: Rejection[];
}

/** Hand-written decisions, each one traceable to a review result. */
export class Corrections {
  readonly file: CorrectionsFile;

  constructor(file: CorrectionsFile) {
    this.file = file;
  }

  static read(path: string): Corrections {
    return new Corrections(JSON.parse(readFileSync(path, "utf8")));
  }

  mergeFor(item: string): MergeCorrection {
    return this.file.merges[item] ?? {};
  }

  rejectionOf(claim: OwnershipClaim): Rejection | null {
    const owner = claim.owner;
    if (!owner) return null;
    return this.file.rejectedClaims.find((r) => r.brokerId === claim.brokerId && Company.keyOf(r.owner) === owner.key) ?? null;
  }
}
