import type { IslandTheme } from "../input/IslandTheme.ts";

export const MIXED = "mixed";

export interface PreviewState {
  readonly seed: number;
  /** A fixed size for every cell, or null for the mixed grid. */
  readonly size: number | null;
  /** A theme name for every cell, or MIXED. */
  readonly theme: string;
  readonly fitEach: boolean;
}

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`missing #${id}`);
  return found as T;
}

/** The slider runs over log2(size + 1), because sizes span three orders of magnitude. */
function sizeFromSlider(value: number): number {
  return Math.round(Math.pow(2, value)) - 1;
}

export class PreviewControls {
  private readonly seed = element<HTMLInputElement>("seed");
  private readonly shuffle = element<HTMLButtonElement>("shuffle");
  private readonly size = element<HTMLInputElement>("size");
  private readonly sizeValue = element<HTMLOutputElement>("size-value");
  private readonly sizeMixed = element<HTMLInputElement>("size-mixed");
  private readonly theme = element<HTMLSelectElement>("theme");
  private readonly fit = element<HTMLInputElement>("fit");
  private shuffleCount = 0;

  constructor(themes: readonly IslandTheme[], onChange: (state: PreviewState) => void) {
    for (const theme of themes) this.theme.add(new Option(theme.name, theme.name));
    const notify = (): void => {
      this.sizeValue.value = this.sizeMixed.checked ? "mixed" : String(sizeFromSlider(this.size.valueAsNumber));
      onChange(this.state);
    };
    this.seed.addEventListener("change", notify);
    this.theme.addEventListener("change", notify);
    this.fit.addEventListener("change", notify);
    this.sizeMixed.addEventListener("change", notify);
    this.size.addEventListener("input", () => {
      this.sizeMixed.checked = false;
      notify();
    });
    this.shuffle.addEventListener("click", () => {
      this.shuffleCount++;
      this.seed.value = String(Math.imul(this.shuffleCount, 2654435761) >>> 0);
      notify();
    });
  }

  get state(): PreviewState {
    const parsed = Number(this.seed.value);
    return {
      seed: Number.isFinite(parsed) ? Math.floor(Math.abs(parsed)) % 4294967296 : 0,
      size: this.sizeMixed.checked ? null : sizeFromSlider(this.size.valueAsNumber),
      theme: this.theme.value,
      fitEach: this.fit.checked,
    };
  }
}
