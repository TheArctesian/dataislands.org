import { ColorRamp } from "../core/ColorRamp.ts";

export const PROP_KINDS = [
  "conifer",
  "broadleaf",
  "palm",
  "boulder",
  "shrub",
  "flower",
  "hut",
  "watchtower",
  "stones",
] as const;

export type PropKind = (typeof PROP_KINDS)[number];

/** Each list runs lightest to darkest, as "#rrggbb". */
export interface IslandPalette {
  readonly grass: readonly string[];
  readonly soil: readonly string[];
  readonly stone: readonly string[];
  readonly deep: readonly string[];
  readonly trunk: readonly string[];
  readonly conifer: readonly string[];
  readonly leaf: readonly string[];
  readonly frond: readonly string[];
  readonly boulder: readonly string[];
  readonly wall: readonly string[];
  readonly roof: readonly string[];
  readonly accent: readonly string[];
}

export interface IslandTheme {
  readonly name: string;
  readonly palette: IslandPalette;
  readonly propMix: Readonly<Partial<Record<PropKind, number>>>;
}

export class ThemeRamps {
  readonly grass: ColorRamp;
  readonly soil: ColorRamp;
  readonly stone: ColorRamp;
  readonly deep: ColorRamp;
  readonly trunk: ColorRamp;
  readonly conifer: ColorRamp;
  readonly leaf: ColorRamp;
  readonly frond: ColorRamp;
  readonly boulder: ColorRamp;
  readonly wall: ColorRamp;
  readonly roof: ColorRamp;
  readonly accent: ColorRamp;

  constructor(palette: IslandPalette) {
    this.grass = new ColorRamp(palette.grass);
    this.soil = new ColorRamp(palette.soil);
    this.stone = new ColorRamp(palette.stone);
    this.deep = new ColorRamp(palette.deep);
    this.trunk = new ColorRamp(palette.trunk);
    this.conifer = new ColorRamp(palette.conifer);
    this.leaf = new ColorRamp(palette.leaf);
    this.frond = new ColorRamp(palette.frond);
    this.boulder = new ColorRamp(palette.boulder);
    this.wall = new ColorRamp(palette.wall);
    this.roof = new ColorRamp(palette.roof);
    this.accent = new ColorRamp(palette.accent);
  }
}
