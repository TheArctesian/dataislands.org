<script lang="ts">
  import type { PublicFact } from "#lib/atlas/PublicAtlas.ts";

  let { facts, links = false, sourceNames }: { facts: PublicFact[]; links?: boolean; sourceNames: Record<string, string> } = $props();
  const cited = (fact: PublicFact) => fact.sources.map((id) => sourceNames[id] ?? id).join(", ");
</script>

<ul>
  {#each facts as fact (fact.value)}
    <li>
      {#if links}<a href={fact.value} rel="nofollow noopener noreferrer">{fact.value}</a>{:else}{fact.value}{/if}
      <small>Source: {cited(fact)}</small>
    </li>
  {/each}
</ul>

<style>
  ul { margin: 0; padding: 0; list-style: none; }
  li { padding: 0.35rem 0; overflow-wrap: anywhere; }
  small { display: block; color: var(--muted); }
</style>
