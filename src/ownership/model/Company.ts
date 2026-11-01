import { type Source, Sourced } from "./Source.ts";

const LEGAL_SUFFIX = /\s(inc|incorporated|corp|corporation|co|company|llc|lp|llp|ltd|limited|plc|sa|ag|holding|holdings|group)$/;

/** An owner of brokers. Spelling differences between sources resolve to one key. */
export class Company {
  readonly key: string;
  private displayName: string;
  private secTicker: Sourced<string> | null = null;
  private readonly namedBy = new Map<string, Source>();

  constructor(name: string, source: Source) {
    this.displayName = Company.clean(name);
    this.key = Company.keyOf(name);
    this.namedBy.set(source.id, source);
  }

  static clean(name: string): string {
    return name.replace(/\s*\(.*$/, "").replace(/\s*\/[A-Z]{2,3}\/\s*$/, "").trim();
  }

  static keyOf(name: string): string {
    let key = Company.clean(name).toLowerCase().replace(/['’]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
    for (let previous = ""; previous !== key; ) {
      previous = key;
      key = key.replace(LEGAL_SUFFIX, "");
    }
    return key;
  }

  get name(): string {
    return this.displayName;
  }

  get ticker(): Sourced<string> | null {
    return this.secTicker;
  }

  /** SEC titles are often all capitals, so any properly cased spelling replaces them. */
  seenAs(name: string, source: Source): void {
    this.namedBy.set(source.id, source);
    if (this.displayName === this.displayName.toUpperCase()) this.displayName = Company.clean(name);
  }

  listedAs(ticker: string, source: Source): void {
    this.secTicker ??= new Sourced(ticker, [source]);
  }

  toJSON() {
    return { key: this.key, name: this.name, ticker: this.secTicker, sources: [...this.namedBy.keys()].sort() };
  }
}

export class CompanyDirectory {
  private readonly companies = new Map<string, Company>();
  private readonly preferredNames: Readonly<Record<string, string>>;

  constructor(preferredNames: Readonly<Record<string, string>> = {}) {
    this.preferredNames = preferredNames;
  }

  /** Blank names return null. Only SEC filer data supplies tickers, since research rows misassign them. */
  find(rawName: string, source: Source, secTicker: string | null = null): Company | null {
    const name = this.preferredNames[rawName] ?? rawName;
    const key = Company.keyOf(name);
    if (!key) return null;
    const company = this.companies.get(key) ?? new Company(name, source);
    this.companies.set(key, company);
    company.seenAs(name, source);
    if (secTicker) company.listedAs(secTicker, source);
    return company;
  }
}
