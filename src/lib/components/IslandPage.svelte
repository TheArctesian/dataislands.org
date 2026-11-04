<script lang="ts">
  import { onDestroy } from "svelte";
  import { afterNavigate, goto, preloadData, pushState, replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { mapAbove } from "#lib/atlas/islandTravel.ts";
  import { LatestRequest, prefersReducedMotion } from "#lib/atlas/motion.ts";
  import BrokerDialog from "#lib/components/BrokerDialog.svelte";
  import BrokerIcon from "#lib/components/BrokerIcon.svelte";
  import IslandScene from "#lib/components/IslandScene.svelte";
  import type { IslandSummary } from "#lib/atlas/PublicAtlas.ts";

  type Listed = { id: string; name: string; iconFile: string | null };
  let { island, brokers, position }: { island: IslandSummary; brokers: Listed[]; position: number } = $props();
  let query = $state("");
  let pendingId = $state<string | null>(null);
  let source = $state<HTMLElement | null>(null);
  let list = $state<HTMLElement>();
  let listHeight = $state<number | null>(null);
  const shown = $derived(brokers.filter((broker) => broker.name.toLowerCase().includes(query.trim().toLowerCase())));
  const requests = new LatestRequest<string>();
  const map = $derived(mapAbove(page.route.id));
  let cameFromMap = false;

  afterNavigate(({ from }) => {
    if (from) cameFromMap = from.url.pathname === map;
  });

  /** Going back when the map is the last page keeps its scroll, so the island lands where it left. */
  function leaveToMap() {
    if (cameFromMap) history.back();
    else void goto(map);
  }

  function cancelPending() {
    requests.cancel();
    pendingId = null;
  }

  /** Opens in place with its own address. A new tab, or a failed load, gets the full page. */
  async function open(event: MouseEvent, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    const pressed = event.currentTarget as HTMLElement;
    const icon = pressed.querySelector<HTMLElement>("[data-broker-icon]") ?? pressed.closest("li")?.querySelector<HTMLElement>("[data-broker-icon]") ?? null;
    const token = requests.begin(id);
    if (token === null) return;
    pendingId = id;
    const href = `/brokers/${id}`;
    const result = await preloadData(href);
    if (!requests.finish(token)) return;
    pendingId = null;
    if (result.type !== "loaded" || result.status !== 200) {
      location.href = href;
      return;
    }
    source = icon;
    const state = { selected: result.data as NonNullable<App.PageState["selected"]> };
    if (page.state.selected) replaceState(href, state);
    else pushState(href, state);
  }

  function keydown(event: KeyboardEvent) {
    if (event.key === "Escape" && pendingId) cancelPending();
  }

  /** Keeps the page below still while a filter changes how many rows there are. */
  function holdHeight() {
    if (list && listHeight === null) listHeight = list.getBoundingClientRect().height;
  }

  function filtered() {
    holdHeight();
    if (!query.trim()) listHeight = null;
    if (list && !prefersReducedMotion()) {
      list.animate({ opacity: [0.35, 1] }, { duration: 120, easing: "cubic-bezier(.2,.7,.2,1)" });
    }
  }

  onDestroy(cancelPending);
</script>

<svelte:window onkeydown={keydown} />
<svelte:head><title>{island.name}: Data Islands</title></svelte:head>

<div class="intro">
  <h1>{island.name}</h1>
  <p>{island.description} Zoom in and select a company to see its details, or drag to move around.</p>
</div>

{#key island.slug}
  <IslandScene slug={island.slug} {brokers} {position} {open} {pendingId} paused={!!page.state.selected} oninteract={cancelPending} mapName={map === "/owners" ? "owners" : "islands"} onleave={leaveToMap} />
{/key}

<section class="sheet">
  <h2>All {brokers.length} {brokers.length === 1 ? "company" : "companies"}</h2>
  <label>Find a company <input type="search" bind:value={query} autocomplete="off" onfocus={holdHeight} oninput={filtered} /></label>
  <p class="muted" aria-live="polite">Showing {shown.length} of {brokers.length}</p>
  <div class="results" bind:this={list} style:min-height={listHeight === null ? null : `${listHeight}px`}>
    {#if shown.length}
      <ul>{#each shown as broker (broker.id)}<li><BrokerIcon name={broker.name} file={broker.iconFile} /><a href="/brokers/{broker.id}" aria-busy={pendingId === broker.id} onclick={(event) => open(event, broker.id)}>{broker.name}</a></li>{/each}</ul>
    {:else}
      <p>No company here matches that name. Check the spelling, or try another island.</p>
    {/if}
  </div>
</section>

<BrokerDialog {source} />

<style>
  .intro { position: relative; z-index: 1; max-width: 44rem; }
  h1 { margin: 1rem 0 0.5rem; font-size: clamp(2.2rem, 6vw, 4rem); letter-spacing: -0.02em; }
  .intro p { max-width: 58ch; margin: 0; }
  label { display: block; font-weight: 700; }
  input { display: block; width: 100%; margin-top: 0.25rem; padding: 0.55rem 0.7rem; border: 2px solid var(--ink); border-radius: 0.3rem; font: inherit; background: #fff; }
  ul { margin: 0; padding: 0; list-style: none; }
  li { display: flex; align-items: center; gap: 0.6rem; padding: 0.25rem 0; overflow-wrap: anywhere; }
  li a[aria-busy="true"] { opacity: .55; }
</style>
