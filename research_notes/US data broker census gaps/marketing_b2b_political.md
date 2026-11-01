# US marketing, B2B contact and political data brokers missing from the census

Scope: US-operating companies that sell or license data about individuals (voter files, mailing/consumer lists, B2B contact lists, audience and location data). Checked against `data/census/brokers.csv` (920 rows) by name and by domain on 2026-10-30. Pure ad-serving software was excluded.

## Which vendors appear in directories or industry listings

### Takeaway
Only a handful of candidates could be confirmed from primary sources this session. The IAB Tech Lab Data Transparency Label listing and NextMark list-broker directory were not reached, so directory-based coverage is a gap.

### Cited Findings
- Political Data Inc. (PDI) is described as a California voter data vendor selling an enhanced voter file since 1987 — [Political Data & Voter Analytics](https://codamail.com/articles/data-broker-directory/political-data.html) (third-party directory); its own product page says "Almost half of PDI clients purchase individual data files" — [politicaldata.com](https://politicaldata.com/getting-started/individual)
- Edith Roman is a mailing-list manager whose B2B lists are now described as part of infoGroup (Data Axle) — [Edith Roman Associates](https://www.ampliz.com/company/edith-roman-associates/81745670); the list-manager evidence is from 2006–2008 trade press — [Listline e-Newsletter 05/09/07](https://www.chiefmarketer.com/listline-e-newsletter-050907/)
- DM Group presents itself as a list-rental house — [DM Group list resources](https://www.dmgroup.com/list-resources/)
- Quantcast's Audience Grid is an open data platform in which outside data providers connect datasets to Quantcast consumer behavior data — [PR Newswire, Quantcast Audience Grid](https://prnewswire.com/news-releases/quantcast-launches-quantcast-audience-grid-the-largest-open-data-platform-in-digital-advertising-300156492.html) (2015)
- Placer.ai's own site says its panel is "comprised of tens of millions of mobile devices" and offers Data Feeds and an API for delivery — [Placer.ai our data](https://www.placer.ai/resources/our-data/)
- SignalHire is listed as a B2B contact finder covering 850M+ profiles — [SignalHire review, globalgurus](https://globalgurus.org/?p=32609) (third-party); it describes itself as providing verified contacts — [signalhire.com](https://www.signalhire.com)
- Growthlist sells custom B2B contact lists — [growthlist.co](https://growthlist.co/growthlist-bespoke/)
- Fluent is a performance marketing company whose data solutions sell first-party consumer data and share it through Snowflake — [Fluent data solutions](https://fluentco.com/data-solutions); [Fluent Snowflake release](https://investors.fluentco.com/node/12616)

### Inferences
- The political-data and list-rental segments are the most under-covered by the census, based on the absent names.
- Edith Roman and DM Group are plausible additions but their current business is not confirmed by a recent primary source (see Gaps).

### Gaps
- IAB Tech Lab Data Transparency Label listing: not fetched; no vendor list retrieved.
- NextMark list-broker directory: not fetched; no current list-broker roster retrieved.
- Lead Genius, Ziggs, Kaspr, AdBrain, Hanover Lists: not searched in this session.

## Which are absent from the census by name and domain

Absent means no matching name fragment or domain in `brokers.csv` (checked with case-insensitive matching on name and domains).

| Name | Website | Type | Evidence URL | Date checked |
|---|---|---|---|---|
| Political Data Inc. (PDI) | politicaldata.com | Voter file / political data | https://politicaldata.com/getting-started/individual | 2026-10-30 |
| Fluent Inc. | fluentco.com | Consumer first-party data / leads | https://fluentco.com/data-solutions | 2026-10-30 |
| SignalHire | signalhire.com | B2B contact data | https://www.signalhire.com | 2026-10-30 |
| Growthlist | growthlist.co | B2B contact lists | https://growthlist.co/growthlist-bespoke/ | 2026-10-30 |
| Placer.ai | placer.ai | Mobile-device location data | https://www.placer.ai/resources/our-data/ | 2026-10-30 |
| DM Group | dmgroup.com | Mailing list rental (business, consumer, email lists) | https://www.dmgroup.com/list-resources/ | 2026-10-30 |
| Quantcast | quantcast.com | Audience data (cookie and people-level) | https://help.quantcast.com/docs/about-our-data-1 | 2026-10-30 |

Notes on the table:
- Quantcast: evidence URL is from a search snippet and was not fetched. Its "sells data" status depends on Audience Grid and audience-data products, so confidence is moderate.
- Placer.ai: its own page says the data comes from devices but does not use the word "license"; delivery is via Data Feeds and API. Confidence is moderate-high.
- Fluent: the census has no Fluent entry, but its data is consumer-facing and self-described as owned-and-operated survey and registration data. Confidence is moderate-high.

### Candidates not added (evidence insufficient)
- Edith Roman (edithroman.com): absent from census by name and domain. Only trade-press evidence from 2006–2008 and a directory profile found; own site not fetched. Likely a subsidiary of infoGroup/Data Axle, which is already in the census. Needs a parent check against `parent-candidates.csv` before adding.

## Does each company's own site say it sells or licenses data about people?

### Takeaway
Most candidates state their data business on their own site. Placer.ai and Quantcast are the weakest, because they describe data delivery without using the word "license" or "sell".

### Cited Findings
- PDI: its page describes customers purchasing individual data files and printable voter walk and phone lists, but does not use "sell" or "license" — [politicaldata.com](https://politicaldata.com/getting-started/individual)
- DM Group: says "DM Group is your one-stop shop for all of your list rental needs!" — [dmgroup.com](https://www.dmgroup.com/list-resources/)
- Placer.ai: "Placer's panel is comprised of tens of millions of mobile devices"; data delivered via Data Feeds and API — [placer.ai](https://www.placer.ai/resources/our-data/)
- Growthlist: "Get a custom-made list of quality, verified B2B contacts – delivered to your inbox in 24-48 hours." — [growthlist.co](https://growthlist.co/growthlist-bespoke/)
- SignalHire: "Find verified personal and business emails plus direct dials in real time." — [signalhire.com](https://www.signalhire.com)
- Fluent: says it captures consumer consent through opt-in registration and sells first-party data through its data-solutions offering — [fluentco.com/data-solutions](https://fluentco.com/data-solutions); its Snowflake release says data is "self-reported from consumers and sourced exclusively from its owned and operated online consumer survey sites" — [Fluent Snowflake release](https://investors.fluentco.com/node/12616)

### Inferences
- Political data and B2B contact vendors clearly sell data about individuals; the question is answered "yes" by their own sites.
- Placer.ai sells device-derived location data in aggregate to customers. Whether this counts as "data about individuals" depends on the census's definition.

### Gaps
- Quantcast's own current licensing terms were not fetched.
- No regulatory or enforcement history was checked for any candidate.
- Fluent's claim that it "never stores PII beyond the ad-serving moment" is company-stated and unverified.

## Date checked
All sources were checked on 2026-10-30. Third-party directory and comparison-page sources (codamail, globalgurus, Datarade, FullEnrich, Prospeo) are secondary and were used only for discovery, not for the sells-data verdict.
