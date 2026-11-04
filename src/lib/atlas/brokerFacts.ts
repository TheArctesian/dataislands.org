import type { PublicFact } from "./PublicAtlas.ts";

const samePage = (url: string) => url.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/[/#?]+$/, "");

/** An address as a reader says it: no protocol, no www, no trailing slash. */
export const linkLabel = (url: string): string => url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

/** The same page listed twice, or already given in `shown`, appears once. Sources of a repeat within the list are kept. */
export function distinctLinks(facts: PublicFact[], shown: PublicFact[] = []): PublicFact[] {
  const already = new Set(shown.map((fact) => samePage(fact.value)));
  const pages = new Map<string, PublicFact>();
  for (const fact of facts) {
    const page = samePage(fact.value);
    if (already.has(page)) continue;
    const found = pages.get(page);
    pages.set(page, found ? { ...found, sources: [...new Set([...found.sources, ...fact.sources])] } : fact);
  }
  return [...pages.values()];
}

export interface CitedSource {
  name: string;
  title: string | null | undefined;
  url: string;
}

/** Numbers sources by first use, so every fact on a page can point at one list. */
export class Citations {
  private readonly numbers = new Map<string, number>();

  constructor(facts: { sources: string[] }[]) {
    for (const id of facts.flatMap((fact) => fact.sources)) if (!this.numbers.has(id)) this.numbers.set(id, this.numbers.size + 1);
  }

  /** The note numbers for a set of sources, or for several facts together. */
  of(...facts: { sources: string[] }[]): number[] {
    const ids = new Set(facts.flatMap((fact) => fact.sources));
    return [...ids].map((id) => this.numbers.get(id)!).sort((a, b) => a - b);
  }

  get list(): { number: number; id: string }[] {
    return [...this.numbers].map(([id, number]) => ({ number, id }));
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function readableDate(date: string): string {
  const [year, month, day] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  if (!name) return date;
  return day ? `${Number(day)} ${name} ${year}` : `${name} ${year}`;
}

export interface RegistryRow {
  state: string;
  asOf: string;
  sources: string[];
}

/** One row per state, from its latest record. Older snapshots of the same registration add nothing to read. */
export function registryRows(facts: PublicFact[]): RegistryRow[] {
  const latest = new Map<string, RegistryRow>();
  for (const { value, sources } of facts) {
    const [place = value, date = ""] = value.split(", as of ");
    const state = place.replace(/\s*\(.*$/, "");
    const found = latest.get(state);
    if (!found || date > found.asOf) latest.set(state, { state, asOf: date, sources });
    else if (date === found.asOf) found.sources = [...new Set([...found.sources, ...sources])];
  }
  return [...latest.values()].sort((a, b) => a.state.localeCompare(b.state)).map((row) => ({ ...row, asOf: readableDate(row.asOf) }));
}

const readableType = (value: string) => value.replace(/\bid\b/, "ID");

/** What a registry lists, leaving out what the company itself already declared. "Other" reads last, since it names nothing. */
export function otherDataTypes(listed: PublicFact[], declared: PublicFact[]): PublicFact[] {
  const named = new Set(declared.map((fact) => fact.value));
  return listed.filter((fact) => !named.has(fact.value)).sort((a, b) => Number(a.value === "other") - Number(b.value === "other"));
}

export const dataTypeName = (value: string): string => {
  const words = value === "minors" ? "data about minors" : readableType(value);
  return words.charAt(0).toUpperCase() + words.slice(1);
};
