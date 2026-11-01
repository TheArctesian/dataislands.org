import type { BrokerIndex } from "../model/Broker.ts";
import { DataFlow, type FlowArrangement, FlowParty, type FlowStatus } from "../model/DataFlow.ts";
import { type Confidence, Evidence } from "../model/Evidence.ts";
import type { SourceCatalog, SourceKind } from "../model/Source.ts";
import type { CsvTable, Row } from "./CsvTable.ts";

/** Reads hand-reviewed flows. Unlike research rows, a bad flow row stops the build. */
export class DataFlowTable {
  private readonly table: CsvTable;
  private readonly brokers: BrokerIndex;
  private readonly catalog: SourceCatalog;
  private readonly staleBefore: string;

  constructor(table: CsvTable, brokers: BrokerIndex, catalog: SourceCatalog, staleBefore: string) {
    this.table = table;
    this.brokers = brokers;
    this.catalog = catalog;
    this.staleBefore = staleBefore;
  }

  flows(): DataFlow[] {
    return this.table.rows.map((row) => {
      const id = row["id"] ?? "";
      const source = this.catalog.forUrl(row["evidence_url"] ?? "", row["evidence_type"] as SourceKind);
      if (!source) throw new Error(`no source for flow ${id}`);
      return new DataFlow({
        id,
        supplier: this.party(id, row["supplier"] ?? "", row["supplier_broker_id"] ?? ""),
        recipient: this.party(id, row["recipient"] ?? "", row["recipient_broker_id"] ?? ""),
        dataTypes: (row["data_types"] ?? "").split("|").map((t) => t.trim()).filter(Boolean),
        arrangement: row["arrangement"] as FlowArrangement,
        status: row["status"] as FlowStatus,
        endedOn: row["ended_on"] || null,
        evidence: this.evidence(row, source),
        staleBefore: this.staleBefore,
      });
    });
  }

  private evidence(row: Row, source: NonNullable<ReturnType<SourceCatalog["forUrl"]>>): Evidence {
    return new Evidence({
      source,
      quote: row["evidence_quote"] ?? "",
      date: row["evidence_date"] ?? "",
      confidence: row["confidence"] as Confidence,
      opened: row["evidence_opened"] === "true",
    });
  }

  private party(id: string, name: string, brokerId: string): FlowParty {
    if (!brokerId) return new FlowParty(name);
    const broker = this.brokers.withId(brokerId);
    if (!broker || broker.heldBack) throw new Error(`flow ${id} names unknown broker ${brokerId}`);
    return new FlowParty(name, broker.id);
  }
}
