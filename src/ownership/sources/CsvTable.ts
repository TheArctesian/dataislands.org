import { readFileSync } from "node:fs";

export type Row = Readonly<Record<string, string>>;

export class CsvTable {
  readonly rows: Row[];

  constructor(text: string) {
    const [header, ...lines] = CsvTable.parse(text);
    this.rows = lines.map((line) => Object.fromEntries((header ?? []).map((column, i) => [column, line[i] ?? ""])));
  }

  static read(path: string): CsvTable {
    return new CsvTable(readFileSync(path, "utf8"));
  }

  static format(rows: readonly (readonly string[])[]): string {
    const quote = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value);
    return rows.map((row) => row.map(quote).join(",")).join("\n") + "\n";
  }

  private static parse(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i]!;
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (char === '"') quoted = false;
        else field += char;
      } else if (char === '"') quoted = true;
      else if (char === ",") { row.push(field); field = ""; }
      else if (char === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (char !== "\r") field += char;
    }
    if (field || row.length) rows.push([...row, field]);
    return rows;
  }
}
