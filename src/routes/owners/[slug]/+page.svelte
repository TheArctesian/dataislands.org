<script lang="ts">
  import IslandPage from "#lib/components/IslandPage.svelte";

  let { data } = $props();
</script>

<IslandPage island={data.island} brokers={data.brokers} position={data.position} />
