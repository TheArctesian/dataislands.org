import type { IslandModel } from "../IslandModel.ts";
import type { IslandInput } from "../input/IslandSpec.ts";
import { PreviewStage, type StageStats } from "../render/PreviewStage.ts";
import { MIXED, PreviewControls, type PreviewState } from "./PreviewControls.ts";
import { PLACEHOLDER_THEMES } from "./placeholderThemes.ts";

const CELL_COUNT = 12;
const GRID_SIZES = [0, 3, 15, 63, 255, 1023] as const;
const number = new Intl.NumberFormat("en-US");

function must<T extends Element>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`missing ${selector}`);
  return found;
}

const grid = must<HTMLElement>("#grid");
const readout = must<HTMLElement>("#readout");

function specFor(state: PreviewState, index: number): IslandInput {
  const named = PLACEHOLDER_THEMES.find((t) => t.name === state.theme);
  return {
    seed: (state.seed + Math.imul(index, 2654435761)) >>> 0,
    size: state.size ?? GRID_SIZES[index % GRID_SIZES.length]!,
    theme: named && state.theme !== MIXED ? named : PLACEHOLDER_THEMES[index % PLACEHOLDER_THEMES.length]!,
  };
}

const cellElements = Array.from({ length: CELL_COUNT }, () => {
  const figure = document.createElement("figure");
  figure.className = "cell";
  const view = document.createElement("div");
  view.className = "view";
  const caption = document.createElement("figcaption");
  figure.append(view, caption);
  grid.append(figure);
  return { view, caption };
});

function showStats(stats: StageStats, models: readonly IslandModel[]): void {
  cellElements.forEach(({ caption }, i) => {
    const model = models[i];
    if (model) caption.dataset["triangles"] = number.format(model.triangleCount + model.cloudTriangleCount);
  });
  readout.textContent = `${number.format(stats.triangles)} triangles drawn · ${stats.drawCalls} draw calls · ${stats.geometries} GPU geometries`;
}

const stage = new PreviewStage(must<HTMLCanvasElement>("#stage"), showStats);

function apply(state: PreviewState): void {
  const specs = cellElements.map((_, i) => specFor(state, i));
  stage.setFitEach(state.fitEach);
  stage.setCells(specs.map((spec, i) => ({ element: cellElements[i]!.view, spec })));
  specs.forEach((spec, i) => {
    cellElements[i]!.caption.textContent = `${spec.theme.name}, size ${spec.size}, seed ${spec.seed}`;
  });
}

const controls = new PreviewControls(PLACEHOLDER_THEMES, apply);
apply(controls.state);
