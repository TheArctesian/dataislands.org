import type { Source } from "./Source.ts";

export type Confidence = "high" | "medium" | "low" | "none";

/** A source date at the precision the source gave: a bare year spans the whole year. */
export class EvidenceDate {
  readonly text: string;
  readonly start: string;
  readonly end: string;

  private constructor(text: string, start: string, end: string) {
    this.text = text;
    this.start = start;
    this.end = end;
  }

  static parse(text: string): EvidenceDate | null {
    if (/^\d{4}$/.test(text)) return new EvidenceDate(text, `${text}-01-01`, `${text}-12-31`);
    if (/^\d{4}-\d{2}$/.test(text)) return new EvidenceDate(text, `${text}-01`, `${text}-31`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return new EvidenceDate(text, text, text);
    return null;
  }

  isAfter(other: EvidenceDate): boolean {
    return this.start > other.end;
  }

  endsBefore(isoDate: string): boolean {
    return this.end < isoDate;
  }
}

export class Evidence {
  readonly source: Source;
  readonly quote: string;
  readonly date: EvidenceDate | null;
  readonly confidence: Confidence;
  readonly opened: boolean;

  constructor(fields: { source: Source; quote?: string; date?: string; confidence: Confidence; opened: boolean }) {
    this.source = fields.source;
    this.quote = fields.quote ?? "";
    this.date = EvidenceDate.parse(fields.date ?? "");
    this.confidence = fields.confidence;
    this.opened = fields.opened;
  }

  /** Search summaries and low-confidence reads never decide an owner. */
  get isUsable(): boolean {
    return this.opened && (this.confidence === "high" || this.confidence === "medium");
  }

  toJSON() {
    return { source: this.source.id, url: this.source.url, quote: this.quote, date: this.date?.text ?? null, confidence: this.confidence };
  }
}
