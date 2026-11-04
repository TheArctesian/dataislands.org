<script lang="ts">
  import { tick } from "svelte";
  import { page } from "$app/state";
  import { IconFlight, restingRect } from "#lib/atlas/IconFlight.ts";
  import { prefersReducedMotion } from "#lib/atlas/motion.ts";
  import BrokerDetails from "#lib/components/BrokerDetails.svelte";

  let { source = null }: { source?: HTMLElement | null } = $props();

  let dialog = $state<HTMLDialogElement>();
  let sky = $state<HTMLElement>();
  // The last company stays rendered while the sheet leaves, so it does not empty as it closes.
  let shown = $state<App.PageState["selected"]>();
  let flight: IconFlight | null = null;
  const selected = $derived(page.state.selected);

  const titleIcon = () => dialog?.querySelector<HTMLElement>(".title [data-broker-icon]") ?? null;

  $effect(() => {
    if (selected) shown = selected;
    if (selected && dialog && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
      void riseFromIcon();
    }
    if (!selected && dialog?.open) dialog.close();
  });

  /** The pressed icon travels to become the title's icon, and the sheet grows from where it started. */
  async function riseFromIcon() {
    const from = source?.isConnected ? source.getBoundingClientRect() : null;
    if (!dialog || !from) return;
    const centre = { x: from.left + from.width / 2, y: from.top + from.height / 2 };
    dialog.style.transformOrigin = `${centre.x - dialog.offsetLeft}px ${centre.y - dialog.offsetTop}px`;
    await tick();
    const title = titleIcon();
    if (!title || !source || !sky || !dialog.open || prefersReducedMotion()) return;
    const scale = Number.parseFloat(getComputedStyle(dialog).scale) || 1;
    flight ??= new IconFlight(sky);
    flight.depart(source, title, from, restingRect(title.getBoundingClientRect(), centre, scale));
  }

  /** The dialog owns one history entry, so closing it and pressing Back do the same thing. */
  function closed() {
    const title = titleIcon();
    if (flight && title && dialog) flight.comeBack(title, dialog.getBoundingClientRect());
    if (page.state.selected) history.back();
  }
</script>

<dialog bind:this={dialog} onclose={closed} onclick={(event) => event.target === dialog && dialog?.close()}>
  {#if shown}
    <div class="sheet panel">
      <form method="dialog"><button>Close</button></form>
      <BrokerDetails broker={shown.broker} island={shown.island} sources={shown.sources} />
    </div>
  {/if}
</dialog>
<div class="flight-sky" popover="manual" aria-hidden="true" bind:this={sky}></div>

<style>
  dialog {
    width: min(46rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); padding: 0; border: 0; background: transparent; color: inherit;
    opacity: 0; scale: .92;
    transition: opacity var(--motion-travel) var(--motion-ease), scale var(--motion-travel) var(--motion-ease), display var(--motion-travel) allow-discrete, overlay var(--motion-travel) allow-discrete;
  }
  dialog[open] { opacity: 1; scale: 1; }
  @starting-style { dialog[open] { opacity: 0; scale: .92; } }
  dialog::backdrop { background: rgb(20 48 74 / 0%); transition: background-color var(--motion-fast) var(--motion-ease), display var(--motion-fast) allow-discrete, overlay var(--motion-fast) allow-discrete; }
  dialog[open]::backdrop { background: rgb(20 48 74 / 55%); }
  @starting-style { dialog[open]::backdrop { background: rgb(20 48 74 / 0%); } }
  .flight-sky { position: fixed; inset: 0 auto auto 0; width: 0; height: 0; margin: 0; padding: 0; border: 0; background: none; overflow: visible; pointer-events: none; }
  .panel { max-width: none; }
  form { position: absolute; top: clamp(1.25rem, 4vw, 2.5rem); right: clamp(1.25rem, 4vw, 2.5rem); z-index: 1; }
  @media (min-width: 40rem) { .panel :global(header) { padding-right: 5.5rem; } }
  button { padding: 0.45rem 0.9rem; border: 2px solid var(--ink); border-radius: 0.3rem; background: #fff; color: var(--ink); font: inherit; font-weight: 700; cursor: pointer; transition: background-color var(--motion-fast) var(--motion-ease); }
  button:hover { background: var(--sun); }
  @media (prefers-reduced-motion: reduce) {
    dialog, dialog[open] { scale: 1; transition-duration: var(--motion-fast); }
    @starting-style { dialog[open] { scale: 1; } }
  }
</style>
