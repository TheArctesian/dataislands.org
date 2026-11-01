<script lang="ts">
  import Archipelago from "#lib/components/Archipelago.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Data Islands: a map of US data brokers</title>
  <meta name="description" content="A public map of US data brokers: who they are, who owns them and where to opt out." />
</svelte:head>

<div class="intro">
  <h1>Companies that trade your personal data, mapped as islands.</h1>
  <p>{data.brokerCount} US data brokers. Open an island to find a company, see where its facts came from, and reach its opt-out page.</p>
  <p class="note">Islands are sorted by what each company's own website says it does, and the sorting is automated, so some placements may be wrong. {data.sortedCount} of {data.brokerCount} are placed so far, and {data.ownerCount} have a verified owner.</p>
</div>

<Archipelago islands={data.islands} />

<style>
  .intro { position: relative; z-index: 1; max-width: 44rem; margin-bottom: 1rem; }
  h1 { margin: 1rem 0; font-size: clamp(2.4rem, 6.5vw, 5rem); letter-spacing: -0.02em; }
  p { max-width: 58ch; margin: 0 0 0.5rem; }
  .note { color: var(--muted); }
</style>
