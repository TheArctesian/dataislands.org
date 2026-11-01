<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { islandTravel, type TravelScene } from "#lib/atlas/islandTravel.ts";
  import type { IconLayout, IconSpots } from "#lib/atlas/IconSpots.ts";
  import { CriticalSpring, prefersReducedMotion } from "#lib/atlas/motion.ts";
  import { PanZoomView } from "#lib/atlas/PanZoomView.ts";
  import BrokerIcon from "#lib/components/BrokerIcon.svelte";

  type Listed = { id: string; name: string; iconFile: string | null };
  let { slug, brokers, position, open, pendingId = null, paused = false, oninteract = () => {} }: {
    slug: string; brokers: Listed[]; position: number; open: (event: MouseEvent, id: string) => void;
    pendingId?: string | null; paused?: boolean; oninteract?: () => void;
  } = $props();

  const PHONE_WIDTH = 600;
  const ZOOM_STEP = 1.6;
  const KEY_PAN = 80;
  const MIN_ICON = 8;
  /** Below this an icon is too small to pick reliably, so a click zooms towards it instead. */
  const TAP_SIZE = 20;
  const DRAG_THRESHOLD = 5;
  const CAMERA_RESPONSE = 0.35;
  const THROW_DECAY_PER_SECOND = 5;
  const THROW_MIN_SPEED = 40;
  const LANDING_SPREAD_MS = 260;

  let canvas: HTMLCanvasElement;
  let world: HTMLDivElement;
  let iconLayer: HTMLDivElement;
  let finder = $state<IconSpots | null>(null);
  let width = $state(0);
  let height = $state(0);
  let view = $state(new PanZoomView(1, 1, 1));
  let landed = $state(false);
  let stage = $state.raw<{ setPaused(paused: boolean): void; refresh(): void; onDraw: ((seconds: number) => void) | null } | null>(null);
  let idleBob: ((seconds: number) => number) | null = null;
  let frame = 0;
  let cleanup = () => {};

  const fullSize = $derived(width < PHONE_WIDTH ? 26 : 30);
  const layout = $derived<IconLayout | null>(finder && width && height ? finder.layout(brokers.length, width, height, fullSize + 4) : null);
  const maxZoom = $derived(Math.max((layout?.scale ?? 1) * 1.5, 3));
  const iconSize = $derived(Math.round(Math.max(MIN_ICON, Math.min(fullSize, (fullSize * view.zoom) / (layout?.scale ?? 1)))));

  $effect(() => {
    if (width && height && (view.width !== width || view.height !== height || view.maxZoom !== maxZoom)) {
      stopMotion();
      view = new PanZoomView(width, height, maxZoom);
    }
  });
  $effect(() => {
    void view;
    stage?.refresh();
  });
  $effect(() => {
    stage?.setPaused(paused);
  });

  onMount(async () => {
    const [{ PreviewStage }, { IslandGenerator }, { IconSpots }, { islandInput }, { idlePose }, { IsoFraming }] = await Promise.all([
      import("#islands/render/PreviewStage.ts"),
      import("#islands/IslandGenerator.ts"),
      import("#lib/atlas/IconSpots.ts"),
      import("#lib/atlas/islandInput.ts"),
      import("#islands/render/IdleMotion.ts"),
      import("#islands/render/IsoFraming.ts"),
    ]);
    const input = islandInput(slug, brokers.length, position);
    const generator = new IslandGenerator();
    const bounds = generator.generate(input).screenBounds;
    finder = new IconSpots(generator.shape(input).stack, bounds);
    idleBob = (seconds) => {
      const pixelsPerUnit = (height * view.zoom) / (2 * IsoFraming.halfHeightFor(bounds, width / height));
      return idlePose(seconds, 0).bob * (Math.sqrt(3) / 2) * pixelsPerUnit;
    };
    try {
      const created = new PreviewStage(canvas, () => {}, false);
      created.setCells([{ element: world, spec: input }]);
      created.onDraw = (seconds) => {
        if (iconLayer && idleBob) iconLayer.style.transform = `translateY(${-idleBob(seconds)}px)`;
        if (layout) islandTravel.sceneReady(travelScene);
      };
      created.setPaused(paused);
      stage = created;
      cleanup = () => created.dispose();
    } catch {
      canvas.hidden = true;
    }
  });
  onDestroy(() => {
    islandTravel.sceneGone(travelScene);
    stopMotion();
    cleanup();
  });

  /** The named canvas is this island's stand-in for the map's cell. A zoomed view shows only part of it. */
  const travelScene: TravelScene = { lift: () => !view.isZoomedIn, settle: () => {} };

  function stopMotion() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  /** Glides to a view. A new target takes over from the current position and speed. */
  let cameraTarget: PanZoomView | null = null;
  let springs: { zoom: CriticalSpring; x: CriticalSpring; y: CriticalSpring } | null = null;
  let throwing = false;

  function glideTo(target: PanZoomView) {
    if (prefersReducedMotion()) {
      view = target;
      return;
    }
    if (!springs || throwing) {
      springs = { zoom: new CriticalSpring(view.zoom, CAMERA_RESPONSE), x: new CriticalSpring(view.x, CAMERA_RESPONSE), y: new CriticalSpring(view.y, CAMERA_RESPONSE) };
    }
    throwing = false;
    cameraTarget = target;
    stopMotion();
    let last = performance.now();
    const step = (now: number) => {
      const seconds = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { zoom, x, y } = springs!;
      zoom.step(target.zoom, seconds);
      x.step(target.x, seconds);
      y.step(target.y, seconds);
      if (zoom.isAt(target.zoom, 0.001) && x.isAt(target.x, 0.2) && y.isAt(target.y, 0.2)) {
        view = target;
        springs = null;
        cameraTarget = null;
        frame = 0;
        return;
      }
      view = new PanZoomView(width, height, view.maxZoom, zoom.value, x.value, y.value);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  /** Direct input owns the view at once, so a glide or a throw never fights the hand. */
  function takeOver() {
    stopMotion();
    springs = null;
    cameraTarget = null;
    throwing = false;
  }

  function throwFrom(vx: number, vy: number) {
    if (prefersReducedMotion() || Math.hypot(vx, vy) < THROW_MIN_SPEED) return;
    throwing = true;
    let last = performance.now();
    let speedX = vx;
    let speedY = vy;
    const step = (now: number) => {
      const seconds = Math.min((now - last) / 1000, 0.05);
      last = now;
      const decay = Math.exp(-THROW_DECAY_PER_SECOND * seconds);
      speedX *= decay;
      speedY *= decay;
      const before = view;
      view = view.panBy(speedX * seconds, speedY * seconds);
      const stopped = before.x === view.x && before.y === view.y;
      if (stopped || Math.hypot(speedX, speedY) < THROW_MIN_SPEED / 4) {
        throwing = false;
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  const pointers = new Map<number, { x: number; y: number }>();
  let dragged = 0;
  let pinchDistance = 0;
  let dragSpeed = { x: 0, y: 0 };
  let lastMove = 0;

  function local(event: { clientX: number; clientY: number }, element: Element) {
    const box = element.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  function pointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as Element).closest(".controls")) return;
    takeOver();
    landed = true;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) dragged = 0;
    pinchDistance = 0;
    dragSpeed = { x: 0, y: 0 };
    lastMove = event.timeStamp;
  }

  function pointerMove(event: PointerEvent) {
    const last = pointers.get(event.pointerId);
    if (!last) return;
    const element = event.currentTarget as HTMLElement;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragged += Math.hypot(event.clientX - last.x, event.clientY - last.y);
    if (dragged > DRAG_THRESHOLD && !element.hasPointerCapture(event.pointerId)) {
      element.setPointerCapture(event.pointerId);
      oninteract();
    }
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistance) {
        const middle = local({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }, element);
        view = view.zoomAt(middle.x, middle.y, distance / pinchDistance);
      }
      pinchDistance = distance;
    } else if (dragged > DRAG_THRESHOLD) {
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      const elapsed = Math.max((event.timeStamp - lastMove) / 1000, 0.001);
      dragSpeed = { x: dragSpeed.x * 0.6 + (dx / elapsed) * 0.4, y: dragSpeed.y * 0.6 + (dy / elapsed) * 0.4 };
      lastMove = event.timeStamp;
      view = view.panBy(dx, dy);
    }
  }

  function pointerEnd(event: PointerEvent) {
    const wasOnly = pointers.size === 1;
    pointers.delete(event.pointerId);
    pinchDistance = 0;
    if (wasOnly && dragged > DRAG_THRESHOLD && event.type === "pointerup" && event.timeStamp - lastMove < 80) throwFrom(dragSpeed.x, dragSpeed.y);
  }

  /** At a zoom limit the wheel goes back to scrolling the page, so it never traps the reader. */
  function wheel(event: WheelEvent) {
    const factor = Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.002));
    const atLimit = (factor < 1 && view.zoom <= 1) || (factor > 1 && view.zoom >= view.maxZoom);
    if (atLimit) return;
    event.preventDefault();
    takeOver();
    landed = true;
    const point = local(event, event.currentTarget as Element);
    view = view.zoomAt(point.x, point.y, factor);
  }

  function zoomButton(factor: number) {
    landed = true;
    glideTo((cameraTarget ?? view).zoomAt(width / 2, height / 2, factor));
  }

  function key(event: KeyboardEvent) {
    const moves: Record<string, [number, number]> = { ArrowLeft: [KEY_PAN, 0], ArrowRight: [-KEY_PAN, 0], ArrowUp: [0, KEY_PAN], ArrowDown: [0, -KEY_PAN] };
    const move = moves[event.key];
    if (event.key === "+" || event.key === "=") zoomButton(ZOOM_STEP);
    else if (event.key === "-") zoomButton(1 / ZOOM_STEP);
    else if (move && view.isZoomedIn) glideTo((cameraTarget ?? view).panBy(move[0], move[1]));
    else return;
    event.preventDefault();
  }

  function clicked(event: MouseEvent, id: string, fraction: { x: number; y: number }) {
    const fromPointer = event.detail > 0;
    if (fromPointer && dragged > DRAG_THRESHOLD) {
      event.preventDefault();
      return;
    }
    if (fromPointer && iconSize < TAP_SIZE) {
      event.preventDefault();
      glideTo(view.zoomAt(fraction.x * width * view.zoom + view.x, fraction.y * height * view.zoom + view.y, ZOOM_STEP * ZOOM_STEP));
      return;
    }
    open(event, id);
  }

  function focused(event: FocusEvent, fraction: { x: number; y: number }) {
    if (view.isZoomedIn && (event.currentTarget as Element).matches(":focus-visible")) glideTo(view.centredOn(fraction.x, fraction.y));
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
  class="viewport"
  class:zoomed={view.isZoomedIn}
  role="group"
  tabindex="0"
  aria-label="Island map. Use the plus and minus keys to zoom and the arrow keys to move."
  bind:clientWidth={width}
  bind:clientHeight={height}
  onpointerdown={pointerDown}
  onpointermove={pointerMove}
  onpointerup={pointerEnd}
  onpointercancel={pointerEnd}
  onwheel={wheel}
  onkeydown={key}
>
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
  <div
    class="world"
    bind:this={world}
    style:width="{width * view.zoom}px"
    style:height="{height * view.zoom}px"
    style:transform="translate({view.x}px, {view.y}px)"
  >
    <div class="icons" class:landed bind:this={iconLayer}>
      {#each layout?.positions ?? [] as fraction, index (brokers[index]?.id)}
        {@const broker = brokers[index]!}
        <a
          href="/brokers/{broker.id}"
          title={broker.name}
          aria-label={broker.name}
          aria-busy={pendingId === broker.id}
          draggable="false"
          class:pending={pendingId === broker.id}
          style:left="{fraction.x * 100}%"
          style:top="{fraction.y * 100}%"
          style:--landing-delay="{(index / Math.max(1, brokers.length)) * LANDING_SPREAD_MS}ms"
          onclick={(event) => clicked(event, broker.id, fraction)}
          onfocus={(event) => focused(event, fraction)}
        >
          <BrokerIcon name={broker.name} file={broker.iconFile} size={iconSize} />
        </a>
      {/each}
    </div>
  </div>
  <div class="controls">
    <button aria-label="Zoom in" disabled={view.zoom >= view.maxZoom} onclick={() => zoomButton(ZOOM_STEP)}>+</button>
    <button aria-label="Zoom out" disabled={!view.isZoomedIn} onclick={() => zoomButton(1 / ZOOM_STEP)}>−</button>
    <button disabled={!view.isZoomedIn} onclick={() => zoomButton(1 / (cameraTarget ?? view).zoom)}>Fit</button>
  </div>
</div>

<style>
  .viewport { position: relative; z-index: 1; width: 100%; height: min(78dvh, 110vw); min-height: 22rem; overflow: hidden; cursor: grab; touch-action: pan-y; user-select: none; }
  .viewport.zoomed { touch-action: none; }
  .viewport:active { cursor: grabbing; }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  :global(:root[data-island-shared]) canvas { view-transition-name: island-travel; }
  :global(:root[data-island-shared]) .icons { view-transition-name: island-icons; }
  .world { position: absolute; top: 0; left: 0; transform-origin: 0 0; }
  .icons { position: absolute; inset: 0; }
  a { position: absolute; display: block; line-height: 0; transform: translate(-50%, -100%); filter: drop-shadow(0 1px 2px rgb(20 48 74 / 40%)); -webkit-user-drag: none; transition: scale var(--motion-fast) var(--motion-ease); transform-origin: 50% 100%; animation: land 240ms var(--motion-ease) var(--landing-delay) backwards; }
  .icons.landed a { animation: none; }
  @keyframes land { from { opacity: 0; translate: 0 -8px; } }
  a.pending::after { content: ""; position: absolute; inset: -6px; border: 3px solid var(--cloud); border-top-color: var(--ink); border-radius: 50%; z-index: 1; animation: ring-in var(--motion-fast) linear 100ms backwards, ring-turn 1s linear 100ms infinite; }
  @keyframes ring-in { from { opacity: 0; } }
  @keyframes ring-turn { to { rotate: 1turn; } }
  a :global(img) { pointer-events: none; }
  a:hover, a:focus-visible { z-index: 3; scale: 1.35; }
  .controls { position: absolute; right: 0.5rem; top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem; }
  button { transition: background-color var(--motion-fast) var(--motion-ease); min-width: 2.75rem; min-height: 2.75rem; padding: 0 0.4rem; border: 2px solid var(--ink); border-radius: 0.3rem; background: var(--cloud); color: var(--ink); font: inherit; font-weight: 700; cursor: pointer; }
  button:not(:disabled):hover { background: var(--sun); }
  button:disabled { opacity: 0.45; cursor: default; }
  @media (prefers-reduced-motion: reduce) {
    a, .icons.landed a { animation: none; transition: none; }
    a:hover, a:focus-visible { scale: 1; }
    a.pending::after { animation: none; }
  }
</style>
