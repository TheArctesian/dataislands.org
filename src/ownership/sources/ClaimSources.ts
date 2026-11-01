import type { Broker, BrokerIndex } from "../model/Broker.ts";
import type { CompanyDirectory } from "../model/Company.ts";
import { type Confidence, Evidence } from "../model/Evidence.ts";
import { MergeDecision, type MergeVerdict } from "../model/MergeDecision.ts";
import { ClaimOrigin, OwnershipClaim, type OwnershipType } from "../model/OwnershipClaim.ts";
import { type SourceCatalog, type SourceKind, Sourced } from "../model/Source.ts";
import type { Corrections } from "./Corrections.ts";
import { CsvTable, type Row } from "./CsvTable.ts";

export interface SourceContext {
  brokers: BrokerIndex;
  companies: CompanyDirectory;
  catalog: SourceCatalog;
  corrections: Corrections;
  unmatched: string[];
  rowsWithoutSource: number;
}

const OWNERSHIP_TYPES: ReadonlySet<string> = new Set<OwnershipType>([
  "public", "subsidiary_of_public", "private_equity", "venture_backed",
  "private_independent", "subsidiary_of_private", "nonprofit", "government",
]);
const EVIDENCE_KINDS: Readonly<Record<string, SourceKind>> = {
  sec_filing: "sec_filing", press_release: "press_release", company_page: "company_page", news: "news", state_record: "state_record",
};

export abstract class ClaimSource {
  protected readonly table: CsvTable;
  protected readonly context: SourceContext;

  constructor(table: CsvTable, context: SourceContext) {
    this.table = table;
    this.context = context;
  }

  abstract claims(): OwnershipClaim[];

  protected brokerWithId(id: string): Broker | null {
    const broker = this.context.brokers.withId(id);
    if (!broker) this.context.unmatched.push(`${this.constructor.name}: id ${id}`);
    return broker;
  }

  /** A row citing no page asserts nothing the atlas can repeat. */
  protected evidenceFrom(row: Row, confidence = row["confidence"] as Confidence): Evidence | null {
    const source = this.context.catalog.forUrl(row["evidence_url"] ?? "", EVIDENCE_KINDS[row["evidence_type"] ?? ""]);
    if (!source) return null;
    return new Evidence({
      source,
      quote: row["evidence_quote"] ?? "",
      date: row["evidence_date"] ?? "",
      confidence,
      opened: row["evidence_opened"] === "true",
    });
  }
}

export class ParentReviewSource extends ClaimSource {
  protected readonly origin: ClaimOrigin = ClaimOrigin.ParentReview;

  claims(): OwnershipClaim[] {
    const { brokers, companies, unmatched } = this.context;
    return this.table.rows.flatMap((row) => {
      if (row["verdict"] === "unresolved" || row["verdict"] === "pending") return [];
      const broker = brokers.named(row["broker"] ?? "");
      if (!broker) {
        unmatched.push(`ParentReviewSource: ${row["item"]} ${row["broker"]}`);
        return [];
      }
      const evidence = this.evidenceFrom(row);
      if (!evidence) {
        this.context.rowsWithoutSource++;
        return [];
      }
      return [new OwnershipClaim({
        brokerId: broker.id,
        origin: this.origin,
        evidence,
        immediateParent: companies.find(row["parent"] ?? "", evidence.source),
        ultimateParent: companies.find(row["ultimate_parent"] ?? "", evidence.source),
      })];
    });
  }
}

export class LiteratureSource extends ParentReviewSource {
  protected override readonly origin = ClaimOrigin.Literature;
}

/** A broker's own page, read on the given date. Naming who runs a site does not say who owns it. */
export class BrokerPageSource extends ClaimSource {
  private readonly readOn: string;

  constructor(table: CsvTable, context: SourceContext, readOn: string) {
    super(table, context);
    this.readOn = readOn;
  }

  private evidence(row: Row): Evidence | null {
    return this.evidenceFrom({ ...row, evidence_date: this.readOn, evidence_opened: "true", evidence_type: "company_page" });
  }

  claims(): OwnershipClaim[] {
    return this.table.rows.flatMap((row) => {
      const broker = this.brokerWithId(row["broker_id"] ?? "");
      const evidence = row["relation"] === "parent" ? this.evidence(row) : null;
      if (!broker || !evidence) return [];
      return [new OwnershipClaim({
        brokerId: broker.id,
        origin: ClaimOrigin.BrokerPage,
        evidence,
        immediateParent: this.context.companies.find(row["parent"] ?? "", evidence.source),
      })];
    });
  }

  operators(): Map<string, Sourced<string>> {
    const operators = new Map<string, Sourced<string>>();
    for (const row of this.table.rows) {
      const broker = this.brokerWithId(row["broker_id"] ?? "");
      const evidence = this.evidence(row);
      if (broker && evidence && row["operator"] && row["confidence"] !== "low") {
        operators.set(broker.id, new Sourced(row["operator"], [evidence.source]));
      }
    }
    return operators;
  }
}

/** Only high-confidence confirmations count. Other results wait in the file for a person to review. */
export class GroupCheckSource extends ClaimSource {
  claims(): OwnershipClaim[] {
    return this.table.rows.flatMap((row) => {
      if (row["verdict"] !== "confirmed" || row["confidence"] !== "high") return [];
      const broker = this.brokerWithId(row["broker_id"] ?? "");
      const evidence = this.evidenceFrom(row);
      if (!broker || !evidence) return [];
      return [new OwnershipClaim({
        brokerId: broker.id,
        origin: ClaimOrigin.GroupCheck,
        evidence,
        immediateParent: this.context.companies.find(row["immediate_parent"] ?? "", evidence.source),
        ultimateParent: this.context.companies.find(row["owner"] ?? "", evidence.source),
      })];
    });
  }
}

export class MergeReviewSource extends ClaimSource {
  claims(): OwnershipClaim[] {
    return this.table.rows.flatMap((row) =>
      (this.context.corrections.mergeFor(row["item"] ?? "").owners ?? []).flatMap((entry) => {
        const broker = this.brokerWithId(entry.brokerId);
        const evidence = this.evidenceFrom(row, entry.confidence);
        if (!broker || !evidence) throw new Error(`merge owner without broker or source: ${row["item"]} ${entry.brokerId}`);
        return [new OwnershipClaim({
          brokerId: broker.id,
          origin: ClaimOrigin.MergeReview,
          evidence,
          ultimateParent: this.context.companies.find(entry.owner, evidence.source),
        })];
      }),
    );
  }

  decisions(): MergeDecision[] {
    return this.table.rows.flatMap((row) => {
      const item = row["item"] ?? "";
      const correction = this.context.corrections.mergeFor(item);
      const broker = this.brokerWithId(correction.brokerId ?? row["broker_id"] ?? "");
      if (!broker) return [];
      return [new MergeDecision({
        item,
        brokerId: broker.id,
        verdict: row["verdict"] as MergeVerdict,
        evidence: this.evidenceFrom(row),
        splitInto: correction.splitInto ?? [],
        unconfirmedMembers: correction.unconfirmedMembers ?? [],
      })];
    });
  }
}

export class SecLinkSource extends ClaimSource {
  /** A one-word match is weak: an S&P exhibit line normalised to "deal" matched the alias THE DEAL LLC. */
  claims(): OwnershipClaim[] {
    return this.table.rows.flatMap((row) => {
      const broker = this.brokerWithId(row["broker_id"] ?? "");
      const source = this.context.catalog.forUrl(row["evidence_url"] ?? "", "sec_filing");
      if (!broker || !source) return [];
      const listed = row["link"] === "listed_subsidiary";
      const words = (row["matched_name"] ?? "").split(" ").length;
      return [new OwnershipClaim({
        brokerId: broker.id,
        origin: listed ? ClaimOrigin.SecExhibit : ClaimOrigin.SecNameMatch,
        evidence: new Evidence({
          source,
          quote: row["matched_name"] ?? "",
          date: row["filing_date"] ?? "",
          confidence: !listed ? "low" : words > 1 ? "high" : "medium",
          opened: listed,
        }),
        ultimateParent: this.context.companies.find(row["parent"] ?? "", source, row["ticker"] ?? null),
      })];
    });
  }
}

export class FirstPassSource extends ClaimSource {
  claims(): OwnershipClaim[] {
    const { companies } = this.context;
    return this.table.rows.flatMap((row) => {
      const broker = this.brokerWithId(row["broker_id"] ?? "");
      if (!broker) return [];
      const evidence = this.evidenceFrom(row);
      if (!evidence) {
        this.context.rowsWithoutSource++;
        return [];
      }
      const type = row["ownership_type"] ?? "";
      return [new OwnershipClaim({
        brokerId: broker.id,
        origin: ClaimOrigin.FirstPass,
        evidence,
        immediateParent: companies.find(row["immediate_parent"] ?? "", evidence.source),
        ultimateParent: companies.find(row["ultimate_parent"] ?? "", evidence.source),
        ownershipType: OWNERSHIP_TYPES.has(type) ? (type as OwnershipType) : null,
      })];
    });
  }
}
