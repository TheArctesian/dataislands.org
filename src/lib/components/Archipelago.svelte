<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { IslandSummary } from "#lib/atlas/PublicAtlas.ts";
  import { islandTravel, noteTravelOrigin, type TravelScene } from "#lib/atlas/islandTravel.ts";

  let { islands, basePath = "/islands" }: { islands: readonly IslandSummary[]; basePath?: string } = $props();

  let canvas: HTMLCanvasElement;
  const views: HTMLElement[] = [];
  let dispose = () => {};
  let travelScene: TravelScene | null = null;

  onMount(async () => {
    try {
      const [{ PreviewStage }, { islandInput }] = await Promise.all([
        import("#islands/render/PreviewStage.ts"),
        import("#lib/atlas/islandInput.ts"),
      ]);
      const stage = new PreviewStage(canvas, () => {}, false);
      let lifted: HTMLCanvasElement | null = null;
      let drawn = false;
      travelScene = {
        lift(slug) {
          const view = views[islands.findIndex((island) => island.slug === slug)];
          const box = view?.getBoundingClientRect();
          if (!view || !box || box.bottom <= 0 || box.top >= innerHeight) return false;
          lifted = islandTravel.keptPicture(slug);
          if (lifted) stage.holdCell(view);
          else if (drawn) lifted = stage.liftCell(view);
          if (!lifted) return false;
          islandTravel.keepPicture(slug, lifted);
          lifted.className = "lifted";
          lifted.style.cssText = "position:absolute;inset:0;width:100%;height:100%;view-transition-name:island-travel";
          view.append(lifted);
          return true;
        },
        settle() {
          lifted?.remove();
          lifted = null;
          stage.lowerCell();
        },
      };
      stage.onDraw = () => {
        drawn = true;
        if (travelScene) islandTravel.sceneReady(travelScene);
      };
      // Building every island takes longer than a page change should wait, so a kept picture lands first.
      if (islandTravel.hasKeptPicture) islandTravel.sceneReady(travelScene);
      stage.setCells(islands.map((island, index) => ({
        element: views[index]!,
        spec: islandInput(island.slug, island.brokerCount, index),
      })));
      dispose = () => stage.dispose();
    } catch {
      canvas.hidden = true;
    }
  });
  onDestroy(() => {
    if (travelScene) islandTravel.sceneGone(travelScene);
    dispose();
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>
<ul class:sparse={islands.length < 4}>
  {#each islands as island, index (island.slug)}
    <li class="place-{index}" class:big={island.isProvisional}>
      <a href="{basePath}/{island.slug}" onclick={(event) => noteTravelOrigin(event)}>
        <div class="view" bind:this={views[index]}></div>
        <span class="sign"><strong>{island.name}</strong> {island.brokerCount} {island.brokerCount === 1 ? "broker" : "brokers"}</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  canvas { position: fixed; inset: 0; width: 100%; height: 100dvh; pointer-events: none; z-index: 0; }
  ul { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(12, 1fr); gap: 0 1rem; margin: 0; padding: 0; list-style: none; }
  li { grid-column: span 3; }
  li.big { grid-column: span 6; grid-row: span 2; }
  li:nth-child(even):not(.big) { transform: translateY(2.5rem); }
  a { display: block; color: inherit; text-decoration: none; }
  .view { position: relative; aspect-ratio: 1; }
  .big .view { aspect-ratio: 4 / 3; }
  .sign { transition: background-color var(--motion-fast) var(--motion-ease); display: inline-block; margin-top: -1.5rem; position: relative; padding: 0.3rem 0.7rem 0.4rem; background: var(--cloud); border-radius: 0.2rem 1.1rem 1.1rem 1.1rem; font-size: 0.95rem; }
  .sign strong { display: block; font-family: var(--display); font-size: 1.15rem; }
  a:hover .sign, a:focus-visible .sign { background: var(--sun); }
  @media (max-width: 760px) {
    li, li.big { grid-column: span 6; grid-row: auto; }
    li.big { grid-column: span 12; order: -1; }
    li:nth-child(even):not(.big) { transform: none; }
  }
</style>
