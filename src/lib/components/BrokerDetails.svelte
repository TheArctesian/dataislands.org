<script lang="ts">
  import { Citations, dataTypeName, distinctLinks, linkLabel, otherDataTypes, registryRows, type CitedSource } from "#lib/atlas/brokerFacts.ts";
  import type { IslandSummary, PublicBroker } from "#lib/atlas/PublicAtlas.ts";
  import BrokerIcon from "#lib/components/BrokerIcon.svelte";

  let { broker, island, sources }: { broker: PublicBroker; island: IslandSummary; sources: Record<string, CitedSource> } = $props();

  const optOuts = $derived(distinctLinks(broker.optOutUrls));
  const privacyPages = $derived(distinctLinks(broker.privacyUrls, broker.optOutUrls));
  const registries = $derived(registryRows(broker.registrations));
  const alsoListed = $derived(otherDataTypes(broker.collects, broker.sensitiveData));
  const citations = $derived(new Citations([...broker.tradesAs, ...optOuts, ...privacyPages, ...broker.sensitiveData, ...alsoListed, ...registries, ...broker.domains]));
  const displayName = $derived(broker.tradesAs[0]?.value ?? broker.name);

  /** Moves within the sheet, so a note never adds to the history the dialog owns. */
  function toNote(event: MouseEvent, number: number) {
    event.preventDefault();
    const list = (event.currentTarget as Element).closest(".entry-body")?.querySelector<HTMLElement>(`[data-note="${number}"]`);
    list?.scrollIntoView({ block: "center" });
    list?.focus({ preventScroll: true });
  }
</script>

{#snippet notes(numbers: number[])}<sup class="notes">{#each numbers as number, index (number)}{index ? " " : ""}<a href="#source-{number}" aria-label="Source {number}" onclick={(event) => toNote(event, number)}>{number}</a>{/each}</sup>{/snippet}

<div class="entry-body">
  <header>
    <BrokerIcon name={broker.name} file={broker.iconFile} size={72} />
    <div>
      <p class="island"><a href="/islands/{island.slug}">{island.name}</a></p>
      <h1>{broker.name}</h1>
      {#each broker.tradesAs as name (name.value)}
        <p class="trades">Trades as {name.value}{@render notes(citations.of(name))}</p>
      {/each}
    </div>
  </header>

  {#if broker.categoryEvidence?.quote}
    <blockquote>
      <p>“{broker.categoryEvidence.quote}”</p>
      <footer><a href={broker.categoryEvidence.url} rel="nofollow noopener noreferrer">From its own website</a></footer>
    </blockquote>
  {:else if broker.categoryEvidence}
    <p class="placed">Placed here from <a href={broker.categoryEvidence.url} rel="nofollow noopener noreferrer">its own website</a>.</p>
  {/if}

  <section class="leave" aria-label="Opt out">
    {#if optOuts[0]}
      <a class="exit" href={optOuts[0].value} rel="nofollow noopener noreferrer">
        <strong>Opt out of {displayName}</strong>
        <span>{linkLabel(optOuts[0].value)}</span>
      </a>
      <p class="caveat">Listed in public records{@render notes(citations.of(optOuts[0]))} and not tested by us.</p>
      {#if optOuts.length > 1}
        <h2>Other opt-out pages</h2>
        <ul class="links">
          {#each optOuts.slice(1) as link (link.value)}
            <li><a href={link.value} rel="nofollow noopener noreferrer">{linkLabel(link.value)}</a>{@render notes(citations.of(link))}</li>
          {/each}
        </ul>
      {/if}
    {:else}
      <p class="no-exit">We have no opt-out link for {displayName}.{privacyPages.length ? " Its privacy pages are the place to start." : ""}</p>
    {/if}
    {#if privacyPages.length}
      <h2>Privacy pages</h2>
      <ul class="links">
        {#each privacyPages as link (link.value)}
          <li><a href={link.value} rel="nofollow noopener noreferrer">{linkLabel(link.value)}</a>{@render notes(citations.of(link))}</li>
        {/each}
      </ul>
    {/if}
  </section>

  <div class="record">
    <div class="holds">
      {#if broker.sensitiveData.length}
        <h2>Told California it holds</h2>
        <ul class="sensitive">
          {#each broker.sensitiveData as fact, index (fact.value)}<li>{dataTypeName(fact.value)}{#if index === broker.sensitiveData.length - 1}{@render notes(citations.of(...broker.sensitiveData))}{/if}</li>{/each}
        </ul>
      {/if}
      {#if alsoListed.length}
        <h2>{broker.sensitiveData.length ? "Also on record" : "Data on record"}</h2>
        <ul class="listed">
          {#each alsoListed as fact, index (fact.value)}<li>{dataTypeName(fact.value)}{#if index === alsoListed.length - 1}{@render notes(citations.of(...alsoListed))}{/if}</li>{/each}
        </ul>
      {/if}
      {#if !broker.sensitiveData.length && !alsoListed.length}
        <h2>Data on record</h2>
        <p>The records we hold do not say what data this company has.</p>
      {/if}
    </div>

    <aside>
      <h2>Owner</h2>
      {#if broker.owner}
        <p><strong>{broker.owner.name}</strong>{broker.owner.isItself ? ", named as the company itself. Investors above it may not be listed." : ""}</p>
        <p class="small">{#if broker.owner.quote}“{broker.owner.quote}”{" "}{/if}<a href={broker.owner.evidenceUrl} rel="nofollow noopener noreferrer">Read the source{broker.owner.date ? `, dated ${broker.owner.date}` : ""}</a></p>
      {:else if broker.ownerBeingChecked}
        <p>We have a lead and are checking it.</p>
      {:else}
        <p>Not established. That does not mean it is independent.</p>
      {/if}

      {#if registries.length}
        <h2>Registered in</h2>
        <dl>
          {#each registries as row (row.state)}
            <div><dt>{row.state}</dt><dd>{row.asOf}{@render notes(citations.of(row))}</dd></div>
          {/each}
        </dl>
      {/if}

      {#if broker.domains.length}
        <h2>{broker.domains.length === 1 ? "Website" : "Websites"}</h2>
        <ul class="plain">
          {#each broker.domains as domain (domain.value)}<li>{domain.value}{@render notes(citations.of(domain))}</li>{/each}
        </ul>
      {/if}
    </aside>
  </div>

  <ol class="sources" aria-label="Sources">
    {#each citations.list as { number, id } (id)}
      <li id="source-{number}" data-note={number} tabindex="-1"><span>{number}</span> <a href={sources[id]?.url ?? "/sources"} rel="nofollow noopener noreferrer">{sources[id]?.title ?? sources[id]?.name ?? id}</a>{#if sources[id]?.title && sources[id]?.name}, {sources[id]?.name}{/if}</li>
    {/each}
  </ol>
</div>

<style>
  .entry-body { container-type: inline-size; overflow-wrap: anywhere; }
  header { display: flex; gap: 1.1rem; align-items: flex-start; }
  header :global([data-broker-icon]) { flex: none; }
  .island { margin: 0 0 0.15rem; font-size: 0.95rem; }
  h1 { margin: 0; font-size: clamp(2rem, 7cqi, 3.25rem); letter-spacing: -0.02em; overflow-wrap: break-word; }
  .trades { margin: 0.25rem 0 0; font-family: var(--display); font-size: 1.25rem; color: var(--muted); }

  blockquote { margin: 1.75rem 0 0; }
  blockquote p { margin: 0; max-width: 34ch; font-family: var(--display); font-size: clamp(1.25rem, 4cqi, 1.6rem); line-height: 1.25; }
  blockquote footer { margin-top: 0.35rem; font-size: 0.95rem; }
  .placed { margin: 1.25rem 0 0; }

  .leave { margin-top: 2rem; }
  .exit { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0.15rem 1.5rem; padding: 1.1rem 1.35rem; border-radius: 0.3rem 1.25rem 1.25rem 1.25rem; background: var(--sun); color: var(--ink); text-decoration: none; transition: background-color var(--motion-fast) var(--motion-ease); }
  .exit:hover { background: #ffd666; }
  .exit strong { font-family: var(--display); font-size: clamp(1.25rem, 4cqi, 1.6rem); line-height: 1.15; }
  .exit span { font-size: 0.95rem; text-decoration: underline; }
  .caveat { margin: 0.5rem 0 0; color: var(--muted); font-size: 0.95rem; }
  .no-exit { margin: 0; font-family: var(--display); font-size: clamp(1.25rem, 4cqi, 1.6rem); line-height: 1.25; }

  h2 { margin: 1.75rem 0 0.4rem; font-family: inherit; font-size: 0.95rem; font-weight: 700; color: var(--muted); line-height: 1.3; }
  ul { margin: 0; padding: 0; list-style: none; }
  .links li, .plain li { padding: 0.1rem 0; }

  .record { display: grid; gap: 0 3rem; margin-top: 0.75rem; }
  .sensitive li { font-family: var(--display); font-size: clamp(1.75rem, 6.5cqi, 2.6rem); font-weight: 700; line-height: 1.12; letter-spacing: -0.01em; }
  .listed { display: inline; }
  .listed li { display: inline; font-size: 1.2rem; }
  .listed li:not(:last-child)::after { content: ", "; }
  aside p { margin: 0 0 0.4rem; }
  .small { color: var(--muted); font-size: 0.95rem; }
  dl { margin: 0; }
  dl div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.1rem 0; }
  dt { font-weight: 700; }
  dd { margin: 0; color: var(--muted); white-space: nowrap; }

  .notes { margin-left: 0.15em; font-family: "Atkinson Hyperlegible", sans-serif; font-size: 0.7rem; font-weight: 400; letter-spacing: 0; line-height: 0; }
  .notes a { padding: 0.25em 0.1em; color: var(--link); }

  .sources { margin: 2.5rem 0 0; padding: 1rem 0 0; border-top: 1px solid rgb(20 48 74 / 25%); list-style: none; color: var(--muted); font-size: 0.875rem; }
  .sources li { padding: 0.1rem 0; border-radius: 0.2rem; }
  .sources li:focus { outline: 2px solid var(--ink); outline-offset: 2px; }
  .sources span { display: inline-block; min-width: 1.1em; }

  @container (max-width: 30rem) {
    header { flex-direction: column; gap: 0.6rem; }
  }
  @container (min-width: 36rem) {
    .record { grid-template-columns: minmax(0, 1fr) 15rem; }
  }
</style>
