<script lang="ts">
  import type { IslandSummary, PublicBroker } from "#lib/atlas/PublicAtlas.ts";
  import BrokerIcon from "#lib/components/BrokerIcon.svelte";
  import FactList from "#lib/components/FactList.svelte";

  let { broker, island, sourceNames }: { broker: PublicBroker; island: IslandSummary; sourceNames: Record<string, string> } = $props();
</script>

  <p><a href="/islands/{island.slug}">{island.name}</a></p>
  <div class="title"><BrokerIcon name={broker.name} file={broker.iconFile} size={56} /><h1>{broker.name}</h1></div>

  {#if broker.categoryEvidence}
    <p class="muted">Placed here from its own website{#if broker.categoryEvidence.quote}: “{broker.categoryEvidence.quote}”{/if}. <a href={broker.categoryEvidence.url} rel="nofollow noopener noreferrer">Read the page</a></p>
  {/if}

  <h2>Opt out</h2>
  {#if broker.optOutUrls.length}
    <FactList facts={broker.optOutUrls} links sourceNames={sourceNames} />
  {:else}
    <p>We have no opt-out link on record. Try the company's privacy page below.</p>
  {/if}
  <p class="muted">These links are as declared in the records and have not been tested.</p>

  {#if broker.privacyUrls.length}
    <h2>Privacy pages</h2>
    <FactList facts={broker.privacyUrls} links sourceNames={sourceNames} />
  {/if}

  <h2>Owner</h2>
  {#if broker.owner}
    <p><strong>{broker.owner.name}</strong>{broker.owner.isItself ? ", named as the company itself. Investors above it may not be listed." : ""}</p>
    <p class="muted">{#if broker.owner.quote}“{broker.owner.quote}”{" "}{/if}<a href={broker.owner.evidenceUrl} rel="nofollow noopener noreferrer">Read the source{broker.owner.date ? `, dated ${broker.owner.date}` : ""}</a></p>
  {:else if broker.ownerBeingChecked}
    <p>We have a lead on who owns this company and are checking it.</p>
  {:else}
    <p>Not established yet. This does not mean the company is independent.</p>
  {/if}

  {#if broker.sensitiveData.length}
    <h2>Sensitive data it told California it holds</h2>
    <FactList facts={broker.sensitiveData} sourceNames={sourceNames} />
  {/if}
  {#if broker.collects.length}
    <h2>Data types on record</h2>
    <FactList facts={broker.collects} sourceNames={sourceNames} />
  {/if}
  {#if broker.registrations.length}
    <h2>Registry records</h2>
    <FactList facts={broker.registrations} sourceNames={sourceNames} />
  {/if}
  {#if broker.domains.length}
    <h2>Websites on record</h2>
    <FactList facts={broker.domains} sourceNames={sourceNames} />
  {/if}

<style>
  .title { display: flex; align-items: center; gap: 0.9rem; }
  .title h1 { margin: 0; }
</style>
