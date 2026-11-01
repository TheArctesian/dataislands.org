import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export type SourceKind =
  | "government_registry" | "research_database" | "open_source_dataset"
  | "sec_filing" | "government_report" | "press_release" | "company_page" | "news" | "state_record" | "web_page";

/** Where a fact came from. Licence decides what the atlas may do with facts from it. */
export class Source {
  readonly id: string;
  readonly url: string;
  readonly title: string | null;
  readonly publisher: string | null;
  readonly asOf: string | null;
  readonly licence: string | null;
  private sourceKind: SourceKind;

  constructor(fields: {
    id: string;
    kind: SourceKind;
    url: string;
    title?: string | null;
    publisher?: string | null;
    asOf?: string | null;
    licence?: string | null;
  }) {
    if (!fields.id || !/^https?:\/\//.test(fields.url)) throw new Error(`invalid source: ${fields.id} ${fields.url}`);
    this.id = fields.id;
    this.url = fields.url;
    this.sourceKind = fields.kind;
    this.title = fields.title ?? null;
    this.publisher = fields.publisher ?? null;
    this.asOf = fields.asOf ?? null;
    this.licence = fields.licence ?? null;
  }

  get kind(): SourceKind {
    return this.sourceKind;
  }

  /** One page can be cited by a row that typed it and a row that did not. */
  refineKind(kind: SourceKind): void {
    if (this.sourceKind === "web_page") this.sourceKind = kind;
  }

  toJSON() {
    return {
      id: this.id, kind: this.kind, url: this.url, title: this.title,
      publisher: this.publisher, asOf: this.asOf, licence: this.licence,
    };
  }
}

/** Every source the atlas cites, so each fact can point at one entry by id. */
export class SourceCatalog {
  private readonly sources = new Map<string, Source>();

  static read(path: string): SourceCatalog {
    const catalog = new SourceCatalog();
    for (const fields of JSON.parse(readFileSync(path, "utf8"))) catalog.add(new Source(fields));
    return catalog;
  }

  add(source: Source): Source {
    this.sources.set(source.id, source);
    return source;
  }

  get(id: string): Source {
    const source = this.sources.get(id);
    if (!source) throw new Error(`unknown source: ${id}`);
    return source;
  }

  /** The source for a cited page, or null when a row cites nothing. */
  forUrl(url: string, kind: SourceKind = "web_page"): Source | null {
    if (!url) return null;
    const id = `web-${createHash("sha1").update(url).digest("hex").slice(0, 12)}`;
    const declared = /(^|\.)sec\.gov\//.test(url.replace(/^https?:\/\//, "")) ? "sec_filing" : kind;
    const source = this.sources.get(id) ?? this.add(new Source({ id, kind: declared, url }));
    source.refineKind(declared);
    return source;
  }

  toJSON() {
    return [...this.sources.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
}

/** A value that cannot exist without at least one source. */
export class Sourced<T> {
  readonly value: T;
  readonly sources: readonly Source[];

  constructor(value: T, sources: readonly Source[]) {
    if (sources.length === 0) throw new Error(`no source for ${JSON.stringify(value)}`);
    this.value = value;
    this.sources = [...new Map(sources.map((s) => [s.id, s])).values()];
  }

  toJSON() {
    return { value: this.value, sources: this.sources.map((s) => s.id) };
  }
}
