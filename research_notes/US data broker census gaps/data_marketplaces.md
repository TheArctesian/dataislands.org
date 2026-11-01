# US consumer-data sellers on data marketplaces, missing from the census

Date checked: 2026-10-30. Census compared: `data/census/brokers.csv` (920 rows). Matching was by normalised name substring and by domain, run in Python. Candidate lists came from public sitemaps and public provider pages only, with no logins.

**Exclusion rule applied.** I kept companies that sell record-level or household-level data about individuals: consumer or household files, identity graphs, voter files, contact or email appends, panel or transaction audiences, and property-owner contact data. I excluded the following:
- B2B-only firmographic or professional-contact sellers (IntentData.io, PeopleSQL, Leadenhancer, nSightful, Peachtree Data).
- Weather, macro, company-financial and aggregate geodemographic sellers (GapMaps, Geolocet, MBI).
- Customer-data platforms that hold no dataset of their own (Tealium).
- Sellers whose Datarade profile lists HQ outside the US (Latch Media UK, iGoDirect AU, Data Locator Group UK, Smart Money People UK).

## Which consumer-data sellers appear on the marketplaces, and which are absent from the census?

### Takeaway
The census is already thorough. Of roughly 45 well-known consumer-data sellers I checked, the large names (Acxiom, Epsilon, Data Axle, Equifax, TransUnion, L2, Alliant, Aristotle, AtData, BIGDBM, Versium, Verisk/Infutor, Deep Sync, Gravy, Melissa, People Data Labs, Merkle, Lotame and others) are already present. About 20 smaller or non-registry sellers are missing. They are mostly audience or list vendors and brand-owned audience arms, and many are not on state registries. Entries marked "domain unverified" need a human check before ingestion.

### Cited Findings
Table of missing brokers. Data sold is as stated on the evidence page. "Conf." means confidence that the firm is a US-operating seller of personal data absent from the census (H, M or L).

| Name | Website | Data sold | Evidence URL | Date checked | Conf. |
|---|---|---|---|---|---|
| Fluent, Inc. (Fluent Audience Now) | fluentco.com (homepage returned 200) | About 260M opt-in consumer profiles, interest and behaviour data; Snowflake listing refreshed monthly | https://datarade.ai/data-providers/fluent-audience-now/profile ; https://www.fluentco.com/newsroom/fluent-snowflake-partnership | 2026-10-30 | H |
| Datazapp | datazapp.com (200; title "Data Append, Consumer Lists & Political Data") | Demographic, marketing, voter and consumer marketing data; appends | https://datarade.ai/data-providers/datazapp/profile | 2026-10-30 | H |
| Exactis Data Cloud | exactis.com (200, no title; domain unverified) | Demographic, interest, consumer-behaviour data | https://datarade.ai/data-providers/exactis-data-cloud/profile | 2026-10-30 | M |
| i-Behavior Data Cooperative | domain unverified (i-behavior.com did not resolve) | Demographic, interest, consumer-behaviour and audience data (purchase-behaviour co-op) | https://datarade.ai/data-providers/i-behavior-data-cooperative/profile | 2026-10-30 | M |
| PreciseTarget | precisetarget.com (200) | Interest, audience, shopper and brand data | https://datarade.ai/data-providers/precisetarget/profile | 2026-10-30 | H |
| Political Data, Inc. (PDI) | politicaldata.com (200) | Voter data, campaign and election data | https://datarade.ai/data-providers/political-data-inc/profile | 2026-10-30 | H |
| Prosper Insights & Analytics | domain unverified | Consumer behaviour, audience, shopper and spending data | https://datarade.ai/data-providers/prosper-insights-analytics/profile | 2026-10-30 | M |
| BatchData | batchdata.io (200) | 150M+ US property records with owner contact info, residential phone numbers, home-ownership and mortgage data | https://datarade.ai/data-providers/batchdata/profile ; https://app.snowflake.com/marketplace/listing/GZU6ZFSW90Y/batchdata-residential-phone-number-data-sample-data | 2026-10-30 | H |
| Ibotta, Inc. (Ibotta Audiences) | ibotta.com (200) | Shopper, e-receipt and credit-card purchase data, consumer enrichment and audiences | https://app.snowflake.com/marketplace/listing/GZSTZ34PGB3/ibotta-ibotta-for-consumer-enrichment-insights ; https://datarade.ai/data-providers/ibotta-audiences/profile | 2026-10-30 | H |
| Numerator | numerator.com (403 Cloudflare to curl; domain from knowledge, unverified) | Household purchase panel and consumer data | https://app.snowflake.com/marketplace/listing/GZSNZK5PG/numerator-household-purchase-information | 2026-10-30 | M |
| ZeetoGroup (Zeeto) | zeetogroup.com did not resolve to curl; unverified | Consumer intent-signal audiences (home, auto, Medicare, ACA, finance/debt, health conditions, cancer, mass-tort) | https://app.snowflake.com/marketplace/listing/GZSNZU4AW/zeetogroup-residence-consumers-data-homeowner-renter-intent-signals | 2026-10-30 | M; health-condition segments make it a priority |
| Quotient Technology (Quotient Audiences) | quotient.com (unverified) | Audience, POS, CPG and consumer purchase data | https://datarade.ai/data-providers/quotient-audiences/profile | 2026-10-30 | M |
| Visa Inc. (Visa Audiences) | visa.com (unverified) | Demographic, interest and credit-card-derived audience data | https://datarade.ai/data-providers/visa-audiences/profile | 2026-10-30 | M; the census holds no Visa entity |
| Consumer Edge Research | consumer-edge.com (301 redirect only; unverified) | Credit and debit card transaction data, about 100M cards | https://datarade.ai/data-providers/consumer-edge/profile ; https://marketplace.databricks.com/details/1cffe6da-f8cf-49b8-aaa9-9ee2de608e67/Consumer-Edge_-SAMPLE-Consumer-Edge-Restaurants-Transaction-Data-USA-Data-100M-Credit-Debit-Cards-12K- | 2026-10-30 | M; aggregated vs person-level unclear |
| Solution Publishing | domain unverified | "B2C Continuum": 230M US B2C contact data set with email addresses | https://marketplace.databricks.com/details/83c848aa-06ef-4bae-8c39-971f60463a6a/Solution-Publishing_-SAMPLE-B2C-Continuum-from-Solution-Publishing-230M-US-B2C-Contact-Data-Set-Email-Address- | 2026-10-30 | M |
| Lead for Business | domain unverified; HQ not checked | B2B and B2C leads and direct-dial mobile contacts | https://marketplace.databricks.com/details/cc4a9a33-5f41-4787-a8af-81eab233fe6c/Lead-for-Business_-SAMPLE-B2B-B2C-Leads-Database-B2B-Contact-Database-B2B-Contact-Direct-Dial-Mobile- | 2026-10-30 | L; US operation not confirmed |
| oneAudience | oneaudience.com returned an unrelated "Planning Portal" page, so the domain needs checking | Demographic, audience, app-usage and consumer data; Datarade lists HQ USA | https://datarade.ai/data-providers/oneaudience/profile | 2026-10-30 | M |
| Pinsight | domain unverified (pinsightmedia.com did not resolve) | Demographic, telecom, audience and address data; HQ USA | https://datarade.ai/data-providers/pinsight/profile | 2026-10-30 | M |
| Grandata | grandata.com (200) | Consumer behaviour and psychographic data; Datarade lists HQ USA | https://datarade.ai/data-providers/grandata/profile | 2026-10-30 | M |
| Audience Partners | domain unverified | Identity-graph and device-graph data; HQ USA | https://datarade.ai/data-providers/audience-partners/profile | 2026-10-30 | M |
| American Student Marketing (ASM) | domain unverified | Student address, marketing and social-media data; HQ USA | https://datarade.ai/data-providers/american-student-marketing-asm/profile | 2026-10-30 | M; sells data about students |
| K12 Data | domain unverified | Demographic, address and contact data for the K-12 sector; HQ USA | https://datarade.ai/data-providers/k12-data/profile | 2026-10-30 | L; may be educator B2B contacts |
| The People Platform | domain unverified | Location, consumer-behaviour, foot-traffic, mobility and consumer-demographic data; HQ USA | https://datarade.ai/data-providers/the-people-platform/profile | 2026-10-30 | M |
| Shopper Intelligence | domain unverified | Shopper data; HQ USA | https://datarade.ai/data-providers/shopper-intelligence/profile | 2026-10-30 | L; may be aggregate |
| FinancialAudiences | domain unverified | Interest data and address data; Datarade shows no HQ | https://datarade.ai/data-providers/financialaudiences/profile | 2026-10-30 | L |
| Cint | cint.com (403 to curl) | Verified consumer panel audiences on Snowflake | https://app.snowflake.com/marketplace/listing/GZSOZM2M2/cint-cint-verified-audiences | 2026-10-30 | L; the firm is Swedish-headquartered, so US operation needs confirming |

Corroborated by non-marketplace searches (these are not in the table because no per-seller evidence URL was fetched):
- TRAK, Xverum "US Individual Profiles" and US Data Corporation were named in a Datarade search result. US Data Corporation is already in the census. TRAK is absent, but my guessed Datarade profile slug returned 404, so I have no evidence URL and I left it out. Xverum has a Datarade profile (https://datarade.ai/data-providers/xverum/profile) that describes B2B people data, so I excluded it as B2B. The search result's "US Individual Profiles" product is worth a human check.
- Not missing: Porch Group Media/V12 is covered by Datamentors LLC (domains porchgroupmedia.com and v12data.com); Tapad is covered by Experian; Stirista matches an existing Andrews Wharton row, which I did not fully verify.
- Ambiguous: "Bridge" (pet-owner data, 250M people, https://marketplace.databricks.com/details/28f5299d-fff2-4f31-a03a-e4816257600e/Bridge_-SAMPLE-BRIDGE-Pet-Owner-Data-Top-Ranked-US-Data-250M-People-Compliant-Data-Audience-) could be the census row OWMN/thebridgecorp.com, but I could not confirm.
- Other Snowflake consumer-data providers (Audience Acuity, AnalyticsIQ, Affinity Solutions, Commerce Signals, Foursquare, J.D. Power, Precisely and Gravy) are already in the census.
- Seen in marketplace listings but not checked: ecal (https://app.snowflake.com/marketplace/listing/GZSOZ5HEDF/ecal-calendar-marketing-consumer-data), TFE Group, Datastream Group, Scorri, Cordial.

### Inferences
- The missing names cluster in three groups: (a) brand- or retailer-owned audience arms (Ibotta, Visa, Quotient, Numerator); (b) mid-size list and append vendors with no state registration (Datazapp, Exactis, PreciseTarget, i-Behavior, Solution Publishing); (c) lead-gen intent-segment sellers (ZeetoGroup, Fluent). Group (c) sells sensitive-inference segments such as cancer and Medicare, so it is the highest-value gap.
- Confidence is H only where the homepage resolved and the evidence page names consumer-level data. Several Datarade vendor profiles are self-reported and give no website, so domains need a manual or pipeline step.

### Gaps
- I did not obtain a complete list of AWS Data Exchange or LiveRamp providers (see the next section). The table comes from Datarade's sitemap slugs filtered by my keyword list plus Snowflake and Databricks sitemap slugs, so recall is partial. The Datarade filter keyed on words in the provider's name. Providers with neutral names would be missed.
- Datarade profiles give no website URL, so most domains are unverified.
- The AWS sellers named in search (Verisk/Infutor, Data Axle, Epsilon, TransUnion, Alliant, Factori, GapMaps) were all already in the census except GapMaps (aggregate demographics, excluded). The listing pages were only seen as search results at https://aws.amazon.com/marketplace/pp/prodview-s27xlgr7ytmjk and similar.

## Can each marketplace be listed programmatically without an account?

### Takeaway
Three can: Datarade, Snowflake and Databricks, all via public XML sitemaps. Datarade is the only one whose sitemap carries provider-level URLs. AWS Data Exchange has no usable public catalogue; LiveRamp requires a login or a sales contact.

### Cited Findings
- Datarade: robots.txt points to a sitemap index with sub-sitemaps for categories, providers_and_products, use_cases, top_lists, search and other — [robots.txt](https://datarade.ai/robots.txt), [sitemap index](https://datarade.ai/sitemap.xml). The providers_and_products sitemap (gzip, https://datarade.ai/sitemaps/providers_and_products.xml.gz) listed 8,010 URLs, of which 2,755 were distinct `/data-providers/<slug>` provider slugs, on the day checked. Provider pages at `https://datarade.ai/data-providers/<slug>/profile` returned HTTP 200 to plain curl and show a name, HQ country and data-type list, but no website.
- Datarade disallows `/search*`, `/my/*`, and category provider pages beyond page 5 in robots.txt — [robots.txt](https://datarade.ai/robots.txt).
- Datarade rate limiting: after about 15 rapid requests to category provider pages (some by curl, some by WebFetch), the category pages returned HTTP 429 with a Retry-After of 86386 seconds (about 24 hours). Provider profile pages kept returning 200 at about one request per 1.5 seconds. Category listing pages by curl returned a 404-style shell of identical size, so use the sitemap rather than category pages.
- Snowflake Marketplace: robots.txt allows `/marketplace` and `/sitemap.xml` — [robots.txt](https://app.snowflake.com/robots.txt). The sitemap at https://app.snowflake.com/sitemap.xml held 4,408 URLs, about 4,222 of them listing slugs of the form `/marketplace/listing/<ID>/<provider-title-slug>`, with lastmod dates, but no provider-level pages. Provider name is the slug prefix.
- Databricks Marketplace: robots.txt allows `/open-marketplace` and points to a sitemap — [robots.txt](https://marketplace.databricks.com/robots.txt). The sitemap https://marketplace.databricks.com/sitemap.xml held 2,444 URLs of the form `/details/<uuid>/<Provider>_<Title>`. The robots.txt allows only `/open-marketplace`, which is ambiguous about `/details/`, so check terms before crawling.
- AWS Data Exchange: no public sitemap for the Data Exchange catalogue was found. aws.amazon.com/marketplace/sitemap.xml and /marketplace/robots.txt returned 404 to curl, and the product pages `https://aws.amazon.com/marketplace/pp/prodview-*` were reachable only via search results. AWS Marketplace listings exist as public product pages — [example listing](https://aws.amazon.com/marketplace/pp/prodview-s27xlgr7ytmjk).
- LiveRamp Data Marketplace: the Storefront is inside the authenticated product, and LiveRamp docs say to contact your representative for a list of providers by vertical — [LiveRamp docs](https://docs.liveramp.com/connect/en/view-the-storefront-for-data-marketplace-buyers.html). A LiveRamp demo page claims 800K+ segments from 200+ sellers — [demo page](https://liveramp.com/resources/live-access-demo); an older regional blog claims 160+ providers and 200,000 segments, which conflicts. liveramp.com itself did not answer plain curl (HTTP 000) in my environment.

### Inferences
- A pipeline can enumerate Snowflake, Databricks and Datarade from sitemaps alone. Datarade gives the cleanest provider-level index. AWS and LiveRamp cannot be enumerated reliably without an account or a search-driven crawl.
- A pipeline should rate-limit Datarade to about one request every 1.5 to 2 seconds. It should not crawl category pages.

### Gaps
- I did not test Snowflake or Databricks listing pages for fetchability beyond the sitemaps, and I did not read their terms of service.
- AWS Data Exchange: whether a public API exists without AWS credentials is unknown. The documented ADX API needs AWS credentials; I did not verify this.
- Other exchanges (Eyeota, Lotame, The Trade Desk data marketplace, Oracle, Narrative, Revelate, Datarade alternatives) were not covered.
