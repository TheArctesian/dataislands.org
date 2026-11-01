/** Page travel zooms through the island you chose, and back out through the same spot. */
export function noteTravelOrigin(event: MouseEvent): void {
  const style = document.documentElement.style;
  style.setProperty("--travel-x", `${event.clientX}px`);
  style.setProperty("--travel-y", `${event.clientY}px`);
}

type Route = string | null | undefined;
const isMap = (route: Route) => route === "/" || route === "/owners";
const isIsland = (route: Route) => route === "/islands/[slug]" || route === "/owners/[slug]";

export function travelDirection(from: Route, to: Route): "in" | "out" | null {
  if (isMap(from) && isIsland(to)) return "in";
  if (isIsland(from) && isMap(to)) return "out";
  return null;
}

type Params = { slug?: string | undefined } | null | undefined;

export function travelSlug(direction: "in" | "out" | null, from: Params, to: Params): string | null {
  if (direction === "in") return to?.slug ?? null;
  if (direction === "out") return from?.slug ?? null;
  return null;
}

export interface TravelScene {
  /** Names this scene's picture of the island for the page transition. False if it cannot stand in for it. */
  lift(slug: string): boolean;
  settle(): void;
}

/** Waiting longer than this for a slow scene would feel like a stuck click, so the island is left behind. */
const ARRIVAL_WAIT_MS = 400;

/** Hands the chosen island from the page being left to the page arriving, whose scene draws a moment after it mounts. */
export class IslandTravel {
  private scene: TravelScene | null = null;
  private waiting: { slug: string; done: () => void } | null = null;
  private kept: { slug: string; picture: HTMLCanvasElement } | null = null;

  /** The map's picture of the island you left by, ready for the way back. */
  keepPicture(slug: string, picture: HTMLCanvasElement): void {
    this.kept = { slug, picture };
  }

  keptPicture(slug: string): HTMLCanvasElement | null {
    return this.kept?.slug === slug ? this.kept.picture : null;
  }

  get hasKeptPicture(): boolean {
    return this.kept !== null;
  }

  sceneReady(scene: TravelScene): void {
    if (this.scene === scene) return;
    this.scene = scene;
    if (!this.waiting) return;
    scene.lift(this.waiting.slug);
    this.waiting.done();
  }

  sceneGone(scene: TravelScene): void {
    if (this.scene === scene) this.scene = null;
  }

  depart(slug: string): boolean {
    return this.scene?.lift(slug) ?? false;
  }

  arrive(slug: string, waitMs = ARRIVAL_WAIT_MS): Promise<void> {
    if (this.scene) {
      this.scene.lift(slug);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.waiting = null;
        resolve();
      }, waitMs);
      this.waiting = {
        slug,
        done: () => {
          clearTimeout(timer);
          this.waiting = null;
          resolve();
        },
      };
    });
  }

  land(): void {
    this.scene?.settle();
  }
}

export const islandTravel = new IslandTravel();
