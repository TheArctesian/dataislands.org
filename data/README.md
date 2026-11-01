# Broker census

`python3 pipeline/census.py` rebuilds `data/census/` from `data/raw/`. It reads no clock and no network, so a diff in the output means a source changed.

## Sources

| Folder | What it is | As of | Licence |
|---|---|---|---|
| `raw/cppa` | California Privacy Protection Agency registry | 2026-10-30 | Public record |
| `raw/prc` | Privacy Rights Clearinghouse database of the California, Oregon, Texas and Vermont registries | 2025-04 | CC BY-NC-SA 4.0 |
| `raw/texas` | Texas Secretary of State live registry, read from [the public table](https://texas-sos.appianportalsgov.com/data-broker-registry). Contact people, emails and phone numbers are left out | 2026-10-30 | Public record |
| `raw/incogwe` | Broker seed from `incogwe`, commit `d1a2f5e` | 2026-10-27 | AGPL-3.0 |
| `raw/deletewe` | Broker catalogue from `deletewe`, commit `2419caf` | | AGPL-3.0 |

Anything published from the PRC data must credit Privacy Rights Clearinghouse, stay non-commercial, and share under the same licence.

## Outputs

- `census/brokers.json`: every broker with its sources. `brokers.csv` is the same list, flattened.
- `census/merge-review.csv`: merges a person should check.
- `census/parent-candidates.csv`: possible corporate families, unconfirmed.
- `sources.json`: the hand-written catalogue of datasets the census reads, with publisher and licence.
- `atlas/sources.json`: every source the atlas cites: those datasets plus each page cited as evidence. Facts refer to these by id.
- `atlas/brokers.json`: every publishable broker fact as `{ value, sources }`. Contact emails and held-back brokers are left out.
- `atlas/data-flows.json`: reviewed links showing data moving between companies, built from `flows/data-flows.csv`. Each has a status (`documented`, `reported`, `alleged` or `disputed`) and one required source. A flow never implies ownership. A party has a broker id only when the census lists that exact company.
- `atlas/icons.csv` and `static/icons/`: `python3 pipeline/broker_icons.py` downloads each broker's icon from its own domain so visitors never contact a third party. Icons are trademarks of their owners, used only to identify the company.
- `atlas/link-check.csv`: `python3 pipeline/check_links.py` tests each cited link. Only 404 and 410 count as broken, because a refusal may be bot blocking.
- `ownership/ownership.json`: `npm run ownership` resolves every broker's owner from the SEC links, reviews and first-pass research. Hand decisions live in `ownership/corrections.json`.
- `ownership/page-attempts.csv`: every legal page tried for each unresolved broker, and what came back. `page-review/results.csv` holds the reviewed leads. A named site operator is shown separately and is never treated as an owner.
- `ownership/literature-claims.csv`: owners confirmed from the literature review.
- `ownership/group-check/`: answers rechecked against primary sources. Only `confirmed` at `high` confidence feeds the build; other rows wait for review.
- `ownership/corporate-families.json`: brokers grouped by resolved owner.
- `ownership/ownership-review.csv`: answers that need a person to check them, with reasons.

## Confidence score

`confidenceScore` is a 0 to 1 ranking with the factors behind it: evidence level, primary source, whether the source was opened, age, verification and independent agreement. A disputed or conflicting statement is capped at 0.3. It is not a probability, and only `status` decides what can be published.

## Site

`bun install`, then `bun run dev`. `bun run build` prerenders every page into `build/` from `data/atlas` and `data/ownership/ownership.json`, so rerun `npm run ownership` first when data changes. `PublicAtlas` decides what is shown: only `ready` owners, no data flows yet, and US-scope brokers only.

## Categories

`taxonomy/islands.json` defines the islands. Sonnet and Haiku classify each broker separately from `taxonomy/full/packets-*.json`, and `python3 pipeline/category_merge.py` accepts a label only when both agree at medium or better, on the broker's own domain, on pages that name the broker. Results are in `taxonomy/categories.csv`. A spot-check of 53 found none wrong and 8 arguable. Brokers first labelled as a catch-all were re-sorted by both models under `taxonomy/resort/`, and those without an agreed new category sit in `data-role-unclear`. One Sonnet review with web access settled disagreements under `taxonomy/review/`. Its labels need medium or better, an opened page on the broker's domain that names the broker, and show a quote only if the raw page contains it.

## Sources are required

Every fact names its source. `Sourced` and `Evidence` cannot be built without one, and the build fails on an unknown source id. A research row citing no page is dropped and counted. Only an `unresolved` merge verdict may have none, because it asserts nothing. A removed domain cites the merge review item that decided it.

## How to read it

- A broker is merged only on what its records declare: website, legal name or trading name.
- PRC groups do not merge brokers. They are candidates, because they can join companies that the registry data does not show to be related.
- `registered: false` means not found in these snapshots. It does not mean the company is unregistered today, and must not be published as a finding without checking the live registries.
- Oregon and Vermont data is from April 2025, so recent registrants there are missing. Both live searches require a CAPTCHA.
- `hold_back: true` marks a registrant filed under a person's name with no confirmed business. Do not publish these.
- Only `status: ready` ownership is fit to publish: a verified source, high confidence, dated 2022 or later. A newer source replaces an older one, and owners with dates that cannot be ordered become `conflict`. `isNamedOwner` does not mean a company has no investors above it.
- Each broker's `category_hints` come only from hand-written `deletewe` and curated `incogwe` entries. They are not the island assignment.
