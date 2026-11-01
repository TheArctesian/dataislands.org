import type { IslandPalette, IslandTheme } from "../input/IslandTheme.ts";

const SHARED = {
  soil: ["#CC9B60", "#B79C71", "#8C7151", "#67492D"],
  stone: ["#DCBF9A", "#CC9B60", "#8F7966", "#67492D", "#4D3B2B"],
  deep: ["#8D8E89", "#82837E", "#777874", "#6C6E69", "#62645F"],
  trunk: ["#A0906E", "#79674C", "#4D3B2B"],
  conifer: ["#6F8942", "#526949", "#3C562D", "#2A3F23"],
  leaf: ["#AFB95C", "#8FA34E", "#6F8942", "#536F37", "#3C562D"],
  frond: ["#8F9F50", "#6F8545", "#5D753E"],
  boulder: ["#DCBF9A", "#8F7966", "#85867B", "#62645F"],
  wall: ["#F4EEE1", "#F2E0CF", "#DCBF9A", "#8F7966"],
  roof: ["#F9A52D", "#FC7D20", "#B45838", "#93340D"],
  accent: ["#F9A52D", "#FC7D20", "#CE7D36", "#93340D"],
} satisfies Omit<IslandPalette, "grass">;

/** Visual placeholders to exercise the generator. They are not final categories. */
export const PLACEHOLDER_THEMES: readonly IslandTheme[] = [
  {
    name: "Meadow",
    palette: { ...SHARED, grass: ["#CBD06A", "#AFB95C", "#8FA34E", "#6F8942", "#536F37", "#3C562D"] },
    propMix: { broadleaf: 5, conifer: 3, shrub: 4, flower: 4, boulder: 3, hut: 1, watchtower: 0.5, stones: 0.5 },
  },
  {
    name: "Ember Autumn",
    palette: {
      ...SHARED,
      grass: ["#EDBE5C", "#E4AA43", "#D9963B", "#CE7D36", "#BC6A30", "#A5582B"],
      leaf: ["#E4AA43", "#CE7D36", "#B45838", "#93340D"],
      conifer: ["#6F8942", "#526949", "#3C562D"],
    },
    propMix: { broadleaf: 7, conifer: 2, shrub: 3, boulder: 3, flower: 1, hut: 1.5, stones: 0.5 },
  },
  {
    name: "Dune",
    palette: {
      ...SHARED,
      grass: ["#E8D2A5", "#E4C48F", "#D7B16B", "#CC9B60", "#B79C71", "#B77D56"],
      soil: ["#CC9B60", "#B79C71", "#B77D56", "#8C7151"],
      stone: ["#E4C48F", "#CC9B60", "#B77D56", "#8C7151", "#67492D"],
      leaf: ["#AFB95C", "#8F9F50", "#6F8545"],
    },
    propMix: { boulder: 6, palm: 4, shrub: 2, stones: 1.5, hut: 1, watchtower: 0.5 },
  },
  {
    name: "Frost",
    palette: {
      ...SHARED,
      grass: ["#DCE6E4", "#CFDCDB", "#BFCECF", "#A9BABD", "#8C9699", "#777874"],
      soil: ["#E5EADE", "#8C9699", "#85867B", "#62645F"],
      stone: ["#DFE7DC", "#8C9699", "#85867B", "#777874", "#62645F"],
      conifer: ["#DFE7DC", "#526949", "#3C562D", "#2A3F23"],
      leaf: ["#DFE7DC", "#8C9699", "#526949"],
    },
    propMix: { conifer: 9, boulder: 4, stones: 1, watchtower: 1, hut: 1 },
  },
  {
    name: "Grove Tropic",
    palette: {
      ...SHARED,
      grass: ["#AFB95C", "#8FA34E", "#8F9F50", "#6F8545", "#5D753E", "#3C562D"],
      soil: ["#E8D2A5", "#E4C48F", "#CC9B60", "#8C7151"],
    },
    propMix: { palm: 7, shrub: 5, flower: 5, broadleaf: 2, boulder: 2, hut: 1 },
  },
];
