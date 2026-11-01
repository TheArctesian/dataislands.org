import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Broker, BrokerIndex, type CensusBroker } from "./model/Broker.ts";
import { CompanyDirectory } from "./model/Company.ts";
import { CorporateFamily } from "./model/CorporateFamily.ts";
import type { OwnershipClaim } from "./model/OwnershipClaim.ts";
import { SourceCatalog } from "./model/Source.ts";
import { RejectedClaim } from "./model/OwnershipRecord.ts";
import { OwnershipResolver } from "./model/OwnershipResolver.ts";
import { BrokerPageSource, FirstPassSource, GroupCheckSource, LiteratureSource, MergeReviewSource, ParentReviewSource, SecLinkSource, type SourceContext } from "./sources/ClaimSources.ts";
import { Corrections } from "./sources/Corrections.ts";
import { CsvTable } from "./sources/CsvTable.ts";
import { DataFlowTable } from "./sources/DataFlowTable.ts";

const ROOT = join(import.meta.dirname, "..", "..");
const OWNERSHIP = join(ROOT, "data", "ownership");
const STALE_BEFORE = "2022-01-01";
const PAGES_READ_ON = "2026-10-31";

function json(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 1) + "\n");
}

const census: CensusBroker[] = JSON.parse(readFileSync(join(ROOT, "data", "census", "brokers.json"), "utf8"));
const catalog = SourceCatalog.read(join(ROOT, "data", "sources.json"));
const corrections = Corrections.read(join(OWNERSHIP, "corrections.json"));
const brokers = new BrokerIndex(census.map((b) => new Broker(b, catalog)), corrections.file.brokerIds, corrections.file.brokerNames);
const context: SourceContext = {
  brokers,
  companies: new CompanyDirectory(corrections.file.companyNames),
  catalog,
  corrections,
  unmatched: [],
  rowsWithoutSource: 0,
};

const mergeReview = new MergeReviewSource(CsvTable.read(join(OWNERSHIP, "review", "merge-results.csv")), context);
const researchDir = join(OWNERSHIP, "research");
const brokerPages = new BrokerPageSource(CsvTable.read(join(OWNERSHIP, "page-review", "results.csv")), context, PAGES_READ_ON);
const sources = [
  mergeReview,
  new LiteratureSource(CsvTable.read(join(OWNERSHIP, "literature-claims.csv")), context),
  brokerPages,
  ...readdirSync(join(OWNERSHIP, "group-check")).filter((f) => f.startsWith("results-")).sort()
    .map((f) => new GroupCheckSource(CsvTable.read(join(OWNERSHIP, "group-check", f)), context)),
  new ParentReviewSource(CsvTable.read(join(OWNERSHIP, "review", "parent-results.csv")), context),
  ...readdirSync(researchDir).sort().map((f) => new FirstPassSource(CsvTable.read(join(researchDir, f)), context)),
  new SecLinkSource(CsvTable.read(join(OWNERSHIP, "sec-links.csv")), context),
];

const claimsByBroker = new Map<string, OwnershipClaim[]>();
const rejectedByBroker = new Map<string, RejectedClaim[]>();
for (const claim of sources.flatMap((s) => s.claims())) {
  const rejection = corrections.rejectionOf(claim);
  const reasonSource = rejection && catalog.forUrl(rejection.sourceUrl);
  if (rejection && !reasonSource) throw new Error(`no source for rejecting ${rejection.brokerId} under ${rejection.owner}`);
  if (rejection && reasonSource) {
    rejectedByBroker.set(claim.brokerId, [...(rejectedByBroker.get(claim.brokerId) ?? []), new RejectedClaim(claim, rejection.reason, reasonSource)]);
  } else claimsByBroker.set(claim.brokerId, [...(claimsByBroker.get(claim.brokerId) ?? []), claim]);
}
const decisions = new Map(mergeReview.decisions().map((d) => [d.brokerId, d]));

const reviewItems = new Set(mergeReview.decisions().map((d) => d.item));
for (const broker of brokers.all) {
  for (const { domain, review } of broker.removedDomains) {
    if (!reviewItems.has(review)) throw new Error(`${broker.id}: removal of ${domain} cites unknown review ${review}`);
  }
}

const operators = brokerPages.operators();
const resolver = new OwnershipResolver({ staleBefore: STALE_BEFORE });
const records = brokers.all
  .filter((b) => !b.heldBack)
  .map((b) => resolver.resolve(b, claimsByBroker.get(b.id) ?? [], rejectedByBroker.get(b.id) ?? [], decisions.get(b.id) ?? null, operators.get(b.id) ?? null));
const families = CorporateFamily.fromRecords(records);

const flows = new DataFlowTable(CsvTable.read(join(ROOT, "data", "flows", "data-flows.csv")), brokers, catalog, STALE_BEFORE).flows();

const atlas = join(ROOT, "data", "atlas");
mkdirSync(atlas, { recursive: true });
json(join(atlas, "brokers.json"), brokers.all.filter((b) => !b.heldBack));
json(join(atlas, "data-flows.json"), flows);
json(join(atlas, "sources.json"), catalog);
json(join(OWNERSHIP, "ownership.json"), records);
json(join(OWNERSHIP, "corporate-families.json"), families);
writeFileSync(join(OWNERSHIP, "ownership-review.csv"), CsvTable.format([
  ["broker_id", "broker", "status", "confidence_score", "reasons", "owner", "origin", "evidence_date", "evidence_url", "conflicts_with"],
  ...records.filter((r) => r.status === "needs_check" || r.status === "conflict").map((r) => [
    r.broker.id, r.broker.name.value, r.status, String(r.confidenceScore?.value ?? ""), r.reasons.join(" "), r.owner?.name ?? "", r.winner?.origin.label ?? "",
    r.winner?.evidence.date?.text ?? "", r.winner?.evidence.source.url ?? "", r.conflicts.map((c) => c.owner?.name).join(" | "),
  ]),
]));

const count = (status: string) => records.filter((r) => r.status === status).length;
console.log(`records      ${records.length}`);
for (const status of ["ready", "needs_check", "conflict", "unknown"]) console.log(`${status.padEnd(12)} ${count(status)}`);
console.log(`families     ${families.length} (${families.filter((f) => f.toJSON().members.length > 1).length} with several brokers)`);
console.log(`merge items  ${decisions.size}`);
console.log(`data flows   ${flows.length}`);
console.log(`operators    ${operators.size}`);
console.log(`sources      ${catalog.toJSON().length}`);
console.log(`rows dropped ${context.rowsWithoutSource} (cite no source)`);
if (context.unmatched.length) {
  console.error(`unmatched\n  ${context.unmatched.join("\n  ")}`);
  process.exit(1);
}
