<script lang="ts">
  import "@fontsource-variable/bricolage-grotesque";
  import "@fontsource/atkinson-hyperlegible/400.css";
  import "@fontsource/atkinson-hyperlegible/700.css";
  import "../app.css";
  import bricolageUrl from "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url";
  import atkinsonRegularUrl from "@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2?url";
  import atkinsonBoldUrl from "@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2?url";
  import { onNavigate } from "$app/navigation";
  import { islandTravel, travelDirection, travelSlug } from "#lib/atlas/islandTravel.ts";
  import { prefersReducedMotion } from "#lib/atlas/motion.ts";

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition || document.hidden) return;
    const root = document.documentElement;
    const direction = travelDirection(navigation.from?.route.id, navigation.to?.route.id);
    if (direction) root.dataset["islandTravel"] = direction;
    else delete root.dataset["islandTravel"];
    const slug = travelSlug(direction, navigation.from?.params, navigation.to?.params);
    const shared = !!slug && !prefersReducedMotion() && islandTravel.depart(slug);
    if (shared) root.dataset["islandShared"] = "";
    return new Promise<void>((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
        if (shared) await islandTravel.arrive(slug);
      });
      transition.finished.catch(() => {}).finally(() => {
        delete root.dataset["islandTravel"];
        delete root.dataset["islandShared"];
        islandTravel.land();
      });
      transition.ready.catch(() => {});
    });
  });
</script>

<svelte:head>
  <link rel="preload" href={bricolageUrl} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={atkinsonRegularUrl} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={atkinsonBoldUrl} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<header><a href="/">Data Islands</a><nav><a href="/owners">Owners</a><a href="/sources">Sources</a></nav></header>
<main>{@render children()}</main>
<footer>
  <p>Registry data from California and Texas, and from <a href="https://privacyrights.org">Privacy Rights Clearinghouse</a> (CC BY-NC-SA 4.0). Facts come from these records and from the pages each entry cites. Not being listed here does not mean a company is unregistered.</p>
  <p>This site uses no analytics or third-party scripts.</p>
</footer>

<style>
  header { position: relative; z-index: 2; display: flex; justify-content: space-between; padding: 1rem clamp(1rem, 4vw, 3rem); font-family: var(--display); font-size: 1.1rem; font-weight: 650; }
  nav { display: flex; gap: 1.25rem; }
  header a { color: var(--ink); text-decoration: none; }
  header a:hover { text-decoration: underline; }
  main { position: relative; padding: 0 clamp(1rem, 4vw, 3rem) 4rem; }
  footer { position: relative; z-index: 2; padding: 1.5rem clamp(1rem, 4vw, 3rem) 2.5rem; background: var(--ink); color: var(--cloud); }
  footer p { max-width: 70ch; margin: 0 0 0.6rem; }
  footer a { color: var(--sun); }
</style>
