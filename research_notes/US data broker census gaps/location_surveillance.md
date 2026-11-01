# US location-data, ad-ID and government-facing surveillance brokers missing from the census

Date checked for every row below: 2026-10-30. Census file: data/census/brokers.csv (920 rows). Matching was by id, name and domain substring (grep), not exhaustive fuzzy matching.

## Which location, ad-ID and OSINT vendors have been named by regulators, journalists or in procurement records?

### Takeaway
Every company in the FTC location-data cases (Gravy Analytics, Venntel, X-Mode/Outlogic, Kochava, InMarket, Mobilewalla) is already in the census, along with Unacast, Babel Street, Fog Data Science, Cuebiq, Near, Pen-Link and Arity 875 (the Texas AG defendant). The gaps are mostly government-facing vendors named by journalists (Datastream Group, Anomaly Six, ShadowDragon, Cobwebs, Zignal Labs), a rename/spin-out (Spectus), and a parent company (Digital Envoy).

### Cited Findings

#### Already in the census (confirmed by grep; not gaps)
- FTC action against Gravy Analytics and Venntel (Dec 2024): sale of precise location data without proper consent, and sensitive-trait inferences. Proposed order bars sale of sensitive location data, with a national security/law enforcement exception. This is a regulator allegation resolved by a proposed consent order. — [CyberScoop](https://cyberscoop.com/ftc-data-broker-action-gravy-analytics-venntel-mobilewalla/); [Biometric Update](https://www.biometricupdate.com/202412/ftc-cracks-down-on-two-data-brokers-for-sale-of-sensitive-location-data)
- FTC action against Mobilewalla (Dec 2024): alleged audience segments built from health-clinic visits and app data passed to government clients. — [The Record](https://therecord.media/ftc-location-data-brokers-gravy-venntel-mobilewalla)
- FTC orders against InMarket and X-Mode/Outlogic (early 2024). X-Mode was renamed Outlogic. — [Mondaq](https://www.mondaq.com/unitedstates/privacy-protection/1553878/location-location-location-ftc-continues-data-broker-enforcement-signals-policy-shift)
- FTC sued Kochava in Aug 2022. One secondary source says it later settled, with no terms seen, so I did not verify the terms. — [Biometric Update](https://www.biometricupdate.com/202412/ftc-cracks-down-on-two-data-brokers-for-sale-of-sensitive-location-data)
- Texas AG sued Allstate and Arity on 2025-01-13 under the Texas Data Privacy and Security Act, the data broker law and the Insurance Code. This is an allegation in a lawsuit, not a finding. It alleges that Arity did not register as a data broker. — [Texas AG](https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-sues-allstate-and-arity-unlawfully-collecting-using-and-selling-over-45). Census has arity-875 (arity.com); the exact Arity entity named in the suit was not checked.
- Gravy Analytics and Unacast merged in Nov 2023 and rebranded as Unacast. Venntel is listed as a subsidiary. One aggregator claims Gravy acquired Unacast in April 2024, which I could not verify against a primary source. — [Unacast](https://unacast.com/post/unacast-and-gravy-analytics-merge)
- Census has pen-link (penlink.com), babel-street, fog-data-science, near-intelligence-pte and near-pte, and cuebiq. These need no new rows.

#### Missing from the census: table

Status values: active, renamed (includes acquired or merged into another entity), defunct. "Basis" says whether the evidence is a regulator or court finding, a regulator/legislator inquiry, a journalist allegation, or procurement records.

| Name | Website | Status | Data sold | Evidence URL | Basis | Date checked |
|---|---|---|---|---|---|---|
| Digital Envoy, Inc. (also trades as Digital Element) | digitalenvoy.net per Wikipedia (not fetched); digitalelement.com confirmed in search results | active; parent of X-Mode/Outlogic, which it acquired in Aug 2021 | IP-address geolocation, location intelligence, LocID identity graph; parent of the FTC-ordered X-Mode/Outlogic | https://www.mediapost.com/publications/article/365693/location-data-broker-x-mode-acquired-by-digital-en.html (fetch returned 403; claim rests on search-result text); https://en.wikipedia.org/wiki/Digital_Envoy | Corporate record. The FTC order against X-Mode/Outlogic is a regulator finding, but I did not verify that the order names Digital Envoy as a respondent. | 2026-10-30 |
| Datastream Group | not found in sources | active as of Feb 2025 (Florida-based) | Precise device location data covering US military and intelligence personnel overseas; reseller sourcing from other providers | https://www.404media.co/eskimi-2/ | Journalist allegation (WIRED, Bayerischer Rundfunk, Netzpolitik.org, 404 Media). Datastream's own letter to Sen. Wyden's office named Eskimi as its source. Eskimi denies any relationship. | 2026-10-30 |
| Anomaly Six LLC (Anomaly 6) | not confirmed from fetched sources | active (Intercept reported on it again in July 2026, headline seen only in a search snippet) | Phone location tracking, claimed ~3 billion devices, built on app SDK data; $590,000 US Special Operations Command contract (Sept 2020) per public records cited by the Intercept | https://theintercept.com/2022/04/22/anomaly-six-phone-tracking-zignal-surveillance-cia-nsa/ | Journalist report plus procurement record. The capability claims come from a sales pitch and are unverified. | 2026-10-30 |
| Zignal Labs | not confirmed | active (status as of 2022) | Social media monitoring. Paid about $4M as ECS Federal subcontractor on Project Maven per the Intercept. It says it has no relationship with Anomaly Six. | https://theintercept.com/2022/04/22/anomaly-six-phone-tracking-zignal-surveillance-cia-nsa/ | Journalist report with procurement detail. This is a social-listening vendor, so scope fit is marginal. | 2026-10-30 |
| ShadowDragon | not confirmed from fetched pages | active | OSINT tools (OI Monitor, SocialNet) that pull publicly available data from 200+ sites for government analysts | https://404media.co/the-200-sites-an-ice-surveillance-contractor-is-monitoring/ (2025-03-12); procurement: https://www.brennancenter.org/our-work/research-reports/brennan-center-files-freedom-information-act-requests-information-dhss | Journalist report plus FOIA-obtained ICE/HSI procurement records. Brennan Center put the 2021 HSI OIMonitor purchase at about $171,250. | 2026-10-30 |
| Cobwebs Technologies (Tangles, Webloc) | not confirmed | renamed/acquired: bought by Spire Capital in July 2023 and merged into PenLink (census has pen-link). Map to pen-link. | Open/dark web intelligence (Tangles); Webloc ad-ID geofenced device tracking | https://www.penlink.com/?p=3041 (PenLink announcement); https://jewishbusinessnews.com/2023/07/12/israels-cobwebs-sells-to-spire-capital-for-250-million/ | Corporate announcement. The Webloc/ICE detail (a $2.3M DHS contract with PenLink in Sept 2025, ICE spend over $5M on Cobwebs tools since 2021) comes from press and lawmakers, not verified against USAspending. | 2026-10-30 |
| Spectus | not confirmed (spectus.ai is my recollection only) | renamed/spun out: former Cuebiq Workbench data clean room, now a separate company. Cuebiq remains a separate ad-tech business. Map as related to cuebiq. | Geospatial data clean room, mobility data analytics | https://clara-beta.cuebiq.com/ (Cuebiq's own announcement) | Company statement. No enforcement action found. | 2026-10-30 |
| Placer.ai | placer.ai | active | Foot-traffic analytics from device location data; admitted its data had been accessed for Planned Parenthood locations | https://www.warren.senate.gov/imo/media/doc/Placer.ai%20Response%20to%20Senator%20Warren.pdf | Legislator inquiry (Sen. Warren and colleagues, 2022) and the company's own admission. No FTC or state AG action found. | 2026-10-30 |

### Inferences
- Digital Envoy is the strongest mapping gap. The census lists outlogic and x-mode-social but no parent, so a parent-company link would let the FTC order show up at the right level.
- Cobwebs should map to pen-link, not be added as a standalone broker, if the census treats acquired companies as aliases.
- Spectus and Cuebiq are related but separate businesses, so a parent_candidate link is more accurate than a merge.
- Datastream, Anomaly Six and ShadowDragon are supported only by journalism or procurement records, not regulator findings. Whether the census scope requires registry presence is a question for the owner. Several census rows have registered=True, so these three may be unregistered.

### Gaps
- Not checked or no evidence found, so no rows: Fysical, AirSage, Tutela, Teemo, Predicio, Eskimi (Lithuanian, out of US scope), Fivecast, Echosec, Dataminr, Phunware, Mobiquity, Thasos. A search for Fysical and Digital Envoy together returned nothing on Fysical.
- Searches for Fivecast, Echosec and Cobwebs-with-ICE returned nothing citable, so they are omitted.
- No USAspending.gov or SAM.gov query was run. Procurement figures are as reported by journalists, the Brennan Center and lawmakers, not verified.
- Company websites for Datastream, Anomaly Six, ShadowDragon, Zignal and Spectus were not confirmed from a fetched page.
- Current status was not confirmed for the Gravy/Mobilewalla orders (finalization) or the Kochava settlement terms. Neither was needed for the gap list.
- Whether the Texas v. Allstate/Arity suit has been resolved is unknown. Search results showed nothing after Jan 2025.
- Some links come only from search results and were not fetched (Mediapost returned 403, WIRED blocked). Treat the Digital Envoy acquisition and X-Mode rename details as secondary.
