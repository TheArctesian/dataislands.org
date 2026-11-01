import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type BrokerFile, type CategoryFile, type OwnershipFile, PublicAtlas, type SourceFile } from "#lib/atlas/PublicAtlas.ts";
import { CsvTable } from "../../ownership/sources/CsvTable.ts";

const path = (...parts: string[]) => join(process.cwd(), "data", ...parts);
const read = <T>(...parts: string[]): T => JSON.parse(readFileSync(path(...parts), "utf8")) as T;

let atlas: PublicAtlas | null = null;

export function catalog(): PublicAtlas {
  atlas ??= new PublicAtlas(
    read<BrokerFile[]>("atlas", "brokers.json"),
    read<OwnershipFile[]>("ownership", "ownership.json"),
    read<SourceFile[]>("atlas", "sources.json"),
    read<CategoryFile[]>("taxonomy", "islands.json"),
    CsvTable.read(path("taxonomy", "categories.csv")).rows
      .filter((row) => row["decision"] === "accepted" || row["decision"] === "review_accepted")
      .map((row) => ({ brokerId: row["broker_id"] ?? "", category: row["category"] ?? "", evidenceUrl: row["evidence_url"] ?? "", quote: row["evidence_quote"] ?? "" })),
    new Map(CsvTable.read(path("atlas", "icons.csv")).rows
      .filter((row) => row["file"])
      .map((row) => [row["broker_id"] ?? "", row["file"] ?? ""])),
  );
  return atlas;
}
