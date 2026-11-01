<script lang="ts">
  import BrokerDetails from "#lib/components/BrokerDetails.svelte";

  let { data } = $props();
</script>

<svelte:head><title>{data.broker.name}: Data Islands</title></svelte:head>

<article class="sheet">
  <BrokerDetails broker={data.broker} island={data.island} sourceNames={data.sourceNames} />
</article>
