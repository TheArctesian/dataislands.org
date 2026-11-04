<script lang="ts">
  import BrokerDetails from "#lib/components/BrokerDetails.svelte";

  let { data } = $props();
</script>

<svelte:head><title>{data.broker.name}: Data Islands</title></svelte:head>

<article class="sheet entry">
  <BrokerDetails broker={data.broker} island={data.island} sources={data.sources} />
</article>

<style>
  .entry { max-width: 58rem; margin: 0 auto; }
</style>
