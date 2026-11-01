<script lang="ts">
  import Archipelago from "#lib/components/Archipelago.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Who owns the data brokers: Data Islands</title>
  <meta name="description" content="US data brokers grouped by the company that owns them, each group with a verified source." />
</svelte:head>

<div class="intro">
  <h1>The same owners, many data brokers.</h1>
  <p>Each island is a company that owns two or more brokers. Open one to see which, and the source for each link.</p>
  <p class="note">This covers the {data.groupedBrokers} brokers in these groups. We have verified an owner for {data.verifiedBrokers} of {data.brokerCount} brokers so far, so these groups are incomplete and a small group does not mean a small company.</p>
</div>

<Archipelago islands={data.groups} basePath="/owners" />

<style>
  .intro { position: relative; z-index: 1; max-width: 44rem; margin-bottom: 1rem; }
  h1 { margin: 1rem 0; font-size: clamp(2.4rem, 6.5vw, 5rem); letter-spacing: -0.02em; }
  p { max-width: 58ch; margin: 0 0 0.5rem; }
  .note { color: var(--muted); }
</style>
