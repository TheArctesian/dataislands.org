import assert from "node:assert/strict";
import { test } from "node:test";
import { Broker, BrokerIndex } from "../src/ownership/model/Broker.ts";
import { Source, SourceCatalog } from "../src/ownership/model/Source.ts";
import { CsvTable } from "../src/ownership/sources/CsvTable.ts";
import { DataFlowTable } from "../src/ownership/sources/DataFlowTable.ts";

const HEADER = "id,supplier,supplier_broker_id,recipient,recipient_broker_id,data_types,arrangement,status,ended_on,evidence_url,evidence_type,evidence_opened,evidence_quote,evidence_date,confidence,note";
const catalog = new SourceCatalog();
catalog.add(new Source({ id: "test", kind: "web_page", url: "https://example.test" }));
const provenance = { dba: {}, domains: {}, privacy_urls: {}, opt_out_urls: {}, states: {}, countries: {}, registries: {}, category_hints: {}, california_declarations: [], prc_collects: [] };
const census = (id: string, hold_back: boolean) => new Broker({
  id, name: id, aliases: [id], dba: [], domains: [], hold_back, in_us_scope: true, california_declarations: null, prc_collects: {}, removed_domains: [],
  provenance: { ...provenance, aliases: { [id]: ["test"] } },
}, catalog);
const brokers = new BrokerIndex([census("acme", false), census("person", true)], {}, {});
const read = (row: string) => new DataFlowTable(new CsvTable(`${HEADER}\n${row}\n`), brokers, catalog, "2022-01-01").flows();

test("a flow links a listed broker to an outside party, with its source", () => {
  const [flow] = read("F1,Acme,acme,Agency,,location | email,sale,disputed,,https://example.test/a,news,true,,2025-01-01,medium,");
  assert.equal(flow?.supplier.brokerId, "acme");
  assert.equal(flow?.recipient.brokerId, null);
  assert.deepEqual(flow?.dataTypes, ["location", "email"]);
  assert.equal(flow?.status, "disputed");
  assert.equal(flow?.evidence.source.url, "https://example.test/a");
});

test("a bad flow row stops the build", () => {
  const cases = [
    { row: "F1,Acme,acme,Agency,,email,sale,reported,,,news,true,,2025,medium,", error: /no source/ },
    { row: "F1,Acme,missing,Agency,,email,sale,reported,,https://example.test,news,true,,2025,medium,", error: /unknown broker/ },
    { row: "F1,Acme,person,Agency,,email,sale,reported,,https://example.test,news,true,,2025,medium,", error: /unknown broker/ },
    { row: "F1,Acme,acme,Agency,,,sale,reported,,https://example.test,news,true,,2025,medium,", error: /names no data/ },
    { row: "F1,Acme,acme,Agency,,email,sale,confirmed,,https://example.test,news,true,,2025,medium,", error: /has status/ },
  ];
  for (const { row, error } of cases) assert.throws(() => read(row), error);
});
