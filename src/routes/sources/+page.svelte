<script lang="ts">
  let { data } = $props();
</script>

<svelte:head><title>Sources: Data Islands</title></svelte:head>

<article class="sheet">
  <h1>Sources</h1>
  <p>Every fact on a company's page names where it came from. These are the datasets the list is built on. An owner is shown only when its source has been verified, and links to that source appear beside it.</p>
  {#each data.datasets as source (source.id)}
    <h2><a href={source.url} rel="noopener noreferrer">{source.title}</a></h2>
    <p>{source.publisher}{source.asOf ? `, as of ${source.asOf}` : ""}. Licence: {source.licence}.</p>
  {/each}
</article>
