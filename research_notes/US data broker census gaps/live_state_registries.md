# Live Oregon, Texas and Vermont data broker registries: access and census gaps

Date checked: 2026-10-30. Census compared: `data/census/brokers.csv` (920 rows; OR/TX/VT data from the April 2025 PRC snapshot per `data/README.md`).

## What are the working public URLs and access method for each registry?

### Takeaway
No registry could be enumerated by automated means within the constraints. Texas returned HTTP 403 to automated fetches, Oregon's www4 host disallows all robots, and Oregon's mylicense and Vermont's search are interactive form portals that need a name or other criteria. I did not work around any of these.

### Cited Findings
- Vermont: the official page is now at a different URL than the starting point. `https://sos.vermont.gov/corporations/other-services/data-brokers/` returned HTTP 404 on 2026-10-30. The live page is [Vermont SOS Data Broker](https://sos.vermont.gov/business-services/other-filings/data-broker). It links to the public "Data Broker Search" at https://bizfilings.vermont.gov/databrokersearch/Search, which is also the "Register Online" address. The page lists no download and no registrant count.
- Vermont: registration is due 1-31 January for each year in which the entity meets the definition; mail filings take 7-10 business days — [Vermont SOS Data Broker](https://sos.vermont.gov/business-services/other-filings/data-broker). Fee is $100 under 9 V.S.A. § 2446 — [Vermont SOS Fees](https://sos.vermont.gov/business-services/fees-statutes) (as reported by search result; page not fetched directly).
- Vermont search is an Angular single-page app whose client code calls `https://api.bizfilings.vermont.gov/api`. Its client-side validation messages read "Enter Data Broker Name" and "Enter at least 2 characters", so the search wants a name of at least 2 characters and has no list-all view — [bizfilings main.js](https://bizfilings.vermont.gov/main.e729276acec37478.js). The app's robots.txt at https://bizfilings.vermont.gov/robots.txt was not separately checked. The sos.vermont.gov robots.txt disallows /search/, /admin/ and similar, but does not mention the data broker pages — [robots.txt](https://sos.vermont.gov/robots.txt).
- Texas: the page `https://www.sos.texas.gov/statdoc/data-brokers.shtml` returned HTTP 403 to both WebFetch and a plain curl with an identifying user agent (checked 2026-10-30). Recorded as blocked; I did not retry with other headers. `https://www.sos.texas.gov/robots.txt` returns a 404 HTML page, so no robots rules were found. Per a search summary, the SOS offers a searchable "Data Broker Registry" option on that page, and registration costs $300 — [Texas Appleseed](https://texasappleseed.org/blog/new-texas-data-broker-registry-unveiled); the search result listing also shows the SOS page itself at [sos.texas.gov](https://www.sos.texas.gov/statdoc/data-brokers.shtml) (content not read by me).
- Oregon: the DFR page [Data Broker Registry](https://dfr.oregon.gov/business/licensing/data-broker-registry) says brokers register from 1 January 2024, registrations run to the end of each calendar year, and the renewal fee is $600. It points to the verification search at https://ordcbs.mylicense.com/Verification/Search.aspx?facility=Y and applications at https://ordcbs.mylicense.com/eGov/. It states no registrant count and no downloadable list; its two PDFs are registration and verification guides.
- Oregon verification search is a form with fields Profession, Contractor/Business, License Type, Owner Name, License Status, City, License Number, County and Doing Business As, with `*` wildcards, and no export option was seen — [mylicense search](https://ordcbs.mylicense.com/Verification/Search.aspx?facility=Y). `https://ordcbs.mylicense.com/robots.txt` returned 404 (no rules). The page's opt-out link on www4.cbs.state.or.us is a separate host.
- Oregon www4 host: its robots.txt has `User-agent: *` with `Disallow: /` and a crawl delay of 120 seconds, so automated access to `www4.cbs.state.or.us` (including the group_id=20 / profession_sub_id=28000 starting URL) is not permitted. I did not fetch it — [robots.txt](https://www4.cbs.state.or.us/robots.txt).

### Inferences
- Complete current lists likely need either manual browser use with wildcard searches (Oregon, Vermont), or a request to the agencies. Vermont's 2-character minimum would require many prefix queries, which is a heavier load than "low request rate" suggests. Oregon's DFR contact for the registry is dfr.ndp.licensing@dcbs.oregon.gov (from search summary of the Oregon registry pages; not verified on the official page).
- A public-records request is a possible route for a full export, but I did not make one.

### Gaps
- Contents of the Texas registry page and search: blocked (403).
- Whether Vermont's API permits unauthenticated list queries, and its terms for bulk querying: not tested, to avoid undocumented API use.
- Whether mylicense.com permits a list-all Oregon search: not tested, because the form is interactive and could not be driven with the fetch tool.

## Are any counts published for each registry, and as of what date?

### Takeaway
No registry publishes a count on its own page. The only counts found are from a Privacy Rights Clearinghouse (PRC) and EFF letter, scraped 4-8 April 2025, which is the same period as the census data.

### Cited Findings
- From the PRC/EFF letter to the Texas AG, collected 4-8 April 2025: Vermont 441 registered (current or expired, back to 2019), Texas 226, Oregon 275, California AG legacy 493, California CPPA 459; 750 unique entities across registries; 524 found elsewhere but not in Texas — [PRC Texas letter, 24 June 2025](https://privacyrights.org/sites/default/files/2025-06/2025-06-24%20-%20Texas%20Data%20Broker%20Letter.pdf).
- PRC also published matching Vermont and Oregon letters: [Vermont](https://privacyrights.org/sites/default/files/2025-06/2025-06-24%20-%20Vermont%20Data%20Broker%20Letter.pdf), [Oregon](https://privacyrights.org/sites/default/files/2025-06/2025-06-24%20-%20Oregon%20Data%20Broker%20Letter.pdf). I read only their search-result summaries (Vermont: 309 apparently unregistered; Oregon: 475 apparently unregistered). These are secondary and unverified by me.
- Vermont had 238 registrants when data first became available in 2019, per a search summary of [PRC 2021 report](https://privacyrights.org/resources/registered-data-brokers-united-states-2021); not verified directly.

### Inferences
- Anything newer than April 2025 cannot be counted from the sources I could reach.

### Gaps
- No official count or as-of date for any of the three registries as of 2026.

## Which registrants are absent from the census?

### Takeaway
None can be listed. I could not read any live registry listing, and the rules forbid listing a broker without an evidence URL pointing at the registry.

### Cited Findings
| Name | Website | Registry | Evidence URL | Date checked |
|---|---|---|---|---|
| (none verified) | | | | 2026-10-30 |

- Secondary lead site: offlist.me republishes Vermont registry entries (for example https://www.offlist.me/vt-broker/granite-lists-llc). It is a secondary source and I did not compare its entries to the census, so none are listed.

### Inferences
- The census README already warns that recent OR/TX/VT registrants are missing, so gaps almost certainly exist (the registries run annual cycles, with 2026 filings since the April 2025 snapshot), but this is unquantified.

### Gaps
- Name and domain comparison against `brokers.csv` was not performed because no live registrant list was obtained.
- Suggested next step: have a person run manual wildcard searches in a browser on the Oregon and Vermont portals and the Texas search, then diff against the census by name and domain.
