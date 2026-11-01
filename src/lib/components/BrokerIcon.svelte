<script lang="ts">
  let { name, file, size = 28 }: { name: string; file: string | null; size?: number } = $props();
  let failed = $state(false);
  let needsDarkTile = $state(false);

  /** White logos on a clear background vanish on a white tile. */
  function checkContrast(event: Event) {
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.canvas.width = context.canvas.height = 16;
    context.drawImage(event.currentTarget as HTMLImageElement, 0, 0, 16, 16);
    const { data } = context.getImageData(0, 0, 16, 16);
    let light = 0;
    let solid = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3]! < 40) continue;
      solid++;
      if (Math.min(data[i]!, data[i + 1]!, data[i + 2]!) > 225) light++;
    }
    const hasClearArea = solid < 16 * 16 * 0.9;
    needsDarkTile = solid > 0 && hasClearArea && light / solid > 0.8;
  }
  const letter = $derived(name.match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ?? "?");
</script>

<span class="icon" data-broker-icon class:dark={needsDarkTile} style:--size="{size}px" aria-hidden="true">
  {#if file && !failed}
    <img src="/icons/{file}" alt="" width={size} height={size} loading="lazy" onload={checkContrast} onerror={() => (failed = true)} />
  {:else}
    {letter}
  {/if}
</span>

<style>
  .icon { display: inline-grid; flex: none; place-items: center; width: var(--size); height: var(--size); overflow: hidden; border-radius: 22%; background: #fff; box-shadow: inset 0 0 0 1px var(--sky-low); color: var(--muted); font-family: var(--display); font-weight: 700; font-size: calc(var(--size) * 0.5); line-height: 1; }
  .dark { background: var(--ink); }
  img { width: 100%; height: 100%; object-fit: contain; }
</style>
