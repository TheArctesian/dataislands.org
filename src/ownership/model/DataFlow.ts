import { ConfidenceScore } from "./ConfidenceScore.ts";
import type { Evidence } from "./Evidence.ts";

export type FlowArrangement = "sale" | "resale" | "licence" | "sharing" | "unknown";
/** How far the source goes. A company's denial makes a flow disputed, however well it is reported. */
export type FlowStatus = "documented" | "reported" | "alleged" | "disputed";

const ARRANGEMENTS: readonly string[] = ["sale", "resale", "licence", "sharing", "unknown"] satisfies FlowArrangement[];
const STATUSES: readonly string[] = ["documented", "reported", "alleged", "disputed"] satisfies FlowStatus[];

/** One side of a flow. Only a party the census lists under that exact company has a broker id. */
export class FlowParty {
  readonly name: string;
  readonly brokerId: string | null;

  constructor(name: string, brokerId: string | null = null) {
    if (!name) throw new Error("flow party needs a name");
    this.name = name;
    this.brokerId = brokerId;
  }

  toJSON() {
    return { name: this.name, brokerId: this.brokerId };
  }
}

/** Data moving from one company to another. It says nothing about who owns either company. */
export class DataFlow {
  readonly id: string;
  readonly supplier: FlowParty;
  readonly recipient: FlowParty;
  readonly dataTypes: readonly string[];
  readonly arrangement: FlowArrangement;
  readonly status: FlowStatus;
  readonly endedOn: string | null;
  readonly evidence: Evidence;
  readonly confidenceScore: ConfidenceScore;

  constructor(fields: {
    id: string;
    supplier: FlowParty;
    recipient: FlowParty;
    dataTypes: readonly string[];
    arrangement: FlowArrangement;
    status: FlowStatus;
    endedOn?: string | null;
    evidence: Evidence;
    staleBefore: string;
  }) {
    if (fields.dataTypes.length === 0) throw new Error(`flow ${fields.id} names no data`);
    if (!ARRANGEMENTS.includes(fields.arrangement)) throw new Error(`flow ${fields.id} has arrangement ${fields.arrangement}`);
    if (!STATUSES.includes(fields.status)) throw new Error(`flow ${fields.id} has status ${fields.status}`);
    this.id = fields.id;
    this.supplier = fields.supplier;
    this.recipient = fields.recipient;
    this.dataTypes = fields.dataTypes;
    this.arrangement = fields.arrangement;
    this.status = fields.status;
    this.endedOn = fields.endedOn ?? null;
    this.evidence = fields.evidence;
    this.confidenceScore = ConfidenceScore.of(fields.evidence, { staleBefore: fields.staleBefore, disputed: fields.status === "disputed" });
  }

  involves(brokerId: string): boolean {
    return this.supplier.brokerId === brokerId || this.recipient.brokerId === brokerId;
  }

  toJSON() {
    return {
      id: this.id,
      supplier: this.supplier,
      recipient: this.recipient,
      dataTypes: this.dataTypes,
      arrangement: this.arrangement,
      status: this.status,
      endedOn: this.endedOn,
      confidenceScore: this.confidenceScore,
      sources: [this.evidence.source.id],
      evidence: this.evidence,
    };
  }
}
