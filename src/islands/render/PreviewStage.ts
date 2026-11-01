import { Color, Group, NoToneMapping, SRGBColorSpace, Scene, WebGLRenderer } from "three";
import { IslandGenerator } from "../IslandGenerator.ts";
import type { IslandModel } from "../IslandModel.ts";
import type { IslandInput } from "../input/IslandSpec.ts";
import { CloudView } from "./CloudView.ts";
import { idlePose } from "./IdleMotion.ts";
import { IslandView } from "./IslandView.ts";
import { IsoCamera } from "./IsoCamera.ts";
import { MaterialLibrary } from "./MaterialLibrary.ts";

const MAX_PIXEL_RATIO = 2;
/** A preview backdrop so pale clouds stand clear of the page. It is not a design decision for the site. */
const SKY = new Color("#BCD5D9");

export interface StageCell {
  readonly element: HTMLElement;
  readonly spec: IslandInput;
}

export interface StageStats {
  readonly triangles: number;
  readonly drawCalls: number;
  readonly geometries: number;
}

interface LiveCell {
  readonly element: HTMLElement;
  readonly spec: IslandInput;
  readonly model: IslandModel;
  readonly scene: Scene;
  readonly camera: IsoCamera;
  readonly island: IslandView;
  readonly clouds: CloudView;
  readonly islandGroup: Group;
  readonly phase: number;
  visible: boolean;
}

/** One renderer and one canvas with scissored cell viewports, which stays clear of the browser's context limit. */
export class PreviewStage {
  private readonly canvas: HTMLCanvasElement;
  private readonly showBackdrop: boolean;
  private readonly renderer: WebGLRenderer;
  private readonly materials = new MaterialLibrary();
  private readonly generator = new IslandGenerator();
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly observer: IntersectionObserver;
  private readonly onStats: (stats: StageStats, cells: readonly IslandModel[]) => void;
  private cells: LiveCell[] = [];
  private fitEach = true;
  private frameRequest = 0;
  private contextLost = false;
  private motionStart = 0;
  private pausedAt: number | null = null;
  private lastDrawnAt = 0;
  private liftedElement: HTMLElement | null = null;
  /** Called after each drawn frame with the idle motion's clock, so page elements can share its pose. */
  onDraw: ((seconds: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, onStats: (stats: StageStats, cells: readonly IslandModel[]) => void, showBackdrop = true) {
    this.showBackdrop = showBackdrop;
    this.canvas = canvas;
    this.onStats = onStats;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.renderer.info.autoReset = false;
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const cell = this.cells.find((c) => c.element === entry.target);
        if (cell) cell.visible = entry.isIntersecting;
      }
      this.requestRender();
    });
    this.reducedMotion.addEventListener("change", this.syncLoop);
    document.addEventListener("visibilitychange", this.syncLoop);
    window.addEventListener("resize", this.requestRender);
    window.addEventListener("scroll", this.requestRender, { passive: true });
    canvas.addEventListener("webglcontextlost", this.handleContextLost);
    canvas.addEventListener("webglcontextrestored", this.handleContextRestored);
    this.syncLoop();
  }

  setCells(cells: readonly StageCell[]): void {
    this.disposeCells();
    this.cells = cells.map((cell, index) => this.build(cell, index));
    this.requestRender();
  }

  /** Stops drawing while something covers the stage, and resumes the idle motion where it left off. */
  setPaused(paused: boolean): void {
    if (paused === (this.pausedAt !== null)) return;
    if (paused) {
      this.pausedAt = performance.now();
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = 0;
      return;
    }
    const held = performance.now() - this.pausedAt!;
    this.pausedAt = null;
    if (this.motionAllowed) {
      this.motionStart += held;
      this.frameRequest = requestAnimationFrame(this.tick);
    } else {
      this.requestRender();
    }
  }

  /** Redraws after a cell's element moves without a scroll or resize, such as a pan. */
  refresh(): void {
    this.requestRender();
  }

  /** Copies one cell's current picture out of the shared canvas and stops drawing it, so it can move on its own. */
  liftCell(element: HTMLElement): HTMLCanvasElement | null {
    const rect = element.getBoundingClientRect();
    const box = this.canvas.getBoundingClientRect();
    const copy = document.createElement("canvas");
    const context = copy.getContext("2d");
    if (!context || rect.width === 0 || rect.height === 0 || this.contextLost) return null;
    const ratio = this.renderer.getPixelRatio();
    copy.width = Math.round(rect.width * ratio);
    copy.height = Math.round(rect.height * ratio);
    // A WebGL picture is only readable in the task that drew it.
    this.draw(this.lastDrawnAt);
    context.drawImage(this.canvas, (rect.left - box.left) * ratio, (rect.top - box.top) * ratio, copy.width, copy.height, 0, 0, copy.width, copy.height);
    this.liftedElement = element;
    this.draw(this.lastDrawnAt);
    return copy;
  }

  /** Leaves a cell undrawn while a copy made earlier stands in for it. */
  holdCell(element: HTMLElement): void {
    this.liftedElement = element;
  }

  lowerCell(): void {
    this.liftedElement = null;
    this.requestRender();
  }

  setFitEach(fitEach: boolean): void {
    this.fitEach = fitEach;
    this.requestRender();
  }

  dispose(): void {
    cancelAnimationFrame(this.frameRequest);
    this.reducedMotion.removeEventListener("change", this.syncLoop);
    document.removeEventListener("visibilitychange", this.syncLoop);
    window.removeEventListener("resize", this.requestRender);
    window.removeEventListener("scroll", this.requestRender);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.handleContextRestored);
    this.observer.disconnect();
    this.disposeCells();
    this.materials.dispose();
    this.renderer.dispose();
  }

  private build(cell: StageCell, index: number): LiveCell {
    const model = this.generator.generate(cell.spec);
    const scene = new Scene();
    if (this.showBackdrop) scene.background = SKY;
    const islandGroup = new Group();
    const island = new IslandView(model, this.materials);
    const clouds = new CloudView(model.puffs, this.materials);
    islandGroup.add(island.mesh);
    scene.add(islandGroup);
    for (const { mesh } of clouds.layers) scene.add(mesh);
    this.observer.observe(cell.element);
    return {
      element: cell.element,
      spec: cell.spec,
      model,
      scene,
      camera: new IsoCamera(),
      island,
      clouds,
      islandGroup,
      phase: index * 1.7,
      visible: true,
    };
  }

  private disposeCells(): void {
    for (const cell of this.cells) {
      this.observer.unobserve(cell.element);
      cell.island.dispose();
      cell.clouds.dispose();
    }
    this.cells = [];
    // Program and attribute caches are per-renderer, so this keeps regeneration from accumulating.
    this.renderer.renderLists.dispose();
  }

  private get motionAllowed(): boolean {
    return this.pausedAt === null && !this.reducedMotion.matches && !document.hidden && !this.contextLost;
  }

  private readonly syncLoop = (): void => {
    if (this.pausedAt !== null) return;
    cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
    if (this.motionAllowed) {
      this.motionStart = performance.now();
      this.frameRequest = requestAnimationFrame(this.tick);
    } else {
      this.requestRender();
    }
  };

  private readonly tick = (now: number): void => {
    this.frameRequest = requestAnimationFrame(this.tick);
    if (this.cells.some((cell) => cell.visible)) this.draw((now - this.motionStart) / 1000);
  };

  /** Renders once when no loop is running. A running loop picks up any change on its next frame. */
  private readonly requestRender = (): void => {
    if (this.pausedAt !== null || this.motionAllowed || this.contextLost || this.frameRequest !== 0) return;
    this.frameRequest = requestAnimationFrame(() => {
      this.frameRequest = 0;
      this.draw(0);
    });
  };

  private draw(t: number): void {
    const renderer = this.renderer;
    this.lastDrawnAt = t;
    // Measured from the canvas, because 100dvh and innerHeight can disagree while phone toolbars move.
    const box = this.canvas.getBoundingClientRect();
    const width = box.width;
    const height = box.height;
    if (this.canvas.width !== Math.floor(width * renderer.getPixelRatio()) || this.canvas.height !== Math.floor(height * renderer.getPixelRatio())) {
      renderer.setSize(width, height, false);
    }
    renderer.info.reset();
    renderer.setScissorTest(false);
    // A scene background leaves its colour behind as the clear colour, so restore the page's transparency.
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.setScissorTest(true);
    const shared = Math.max(0, ...this.cells.map((c) => this.halfHeight(c)));
    for (const cell of this.cells) {
      if (!cell.visible || cell.element === this.liftedElement) continue;
      const rect = cell.element.getBoundingClientRect();
      if (rect.bottom <= box.top || rect.top >= box.bottom || rect.width === 0 || rect.height === 0) continue;
      const pose = idlePose(t, cell.phase);
      cell.islandGroup.position.y = pose.bob;
      cell.clouds.layers.forEach(({ mesh }, i) => {
        mesh.position.set(pose.drift[i] ?? 0, 0, -(pose.drift[i] ?? 0));
      });
      const aspect = rect.width / rect.height;
      cell.camera.frame(cell.model.screenBounds, aspect, this.fitEach ? this.halfHeight(cell) : shared);
      const left = rect.left - box.left;
      const fromBottom = box.bottom - rect.bottom;
      renderer.setViewport(left, fromBottom, rect.width, rect.height);
      renderer.setScissor(left, fromBottom, rect.width, rect.height);
      renderer.render(cell.scene, cell.camera.camera);
    }
    this.onDraw?.(t);
    this.onStats(
      {
        triangles: renderer.info.render.triangles,
        drawCalls: renderer.info.render.calls,
        geometries: renderer.info.memory.geometries,
      },
      this.cells.map((c) => c.model),
    );
  }

  private halfHeight(cell: LiveCell): number {
    const rect = cell.element.getBoundingClientRect();
    return IsoCamera.halfHeightFor(cell.model.screenBounds, rect.height === 0 ? 1 : rect.width / rect.height);
  }

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.contextLost = true;
    this.syncLoop();
  };

  private readonly handleContextRestored = (): void => {
    this.contextLost = false;
    const specs = this.cells.map((c) => ({ element: c.element, spec: c.spec }));
    this.setCells(specs);
    this.syncLoop();
  };
}
