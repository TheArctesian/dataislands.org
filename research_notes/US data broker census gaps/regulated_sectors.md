# US regulated-sector data broker census gaps (health, financial, insurance, automotive, tenant, employment)

Date checked for all sources below: 2026-10-30. Census compared: `data/census/brokers.csv` (920 rows, columns id, name, domains, ...). Matching was done by case-insensitive grep on name and domain fragments, so a "no match" means no row with that name or domain fragment, not a proven absence of the company.

Important limits:
- The CFPB 2025 consumer reporting company list PDF could not be read as text (the fetch returned binary PDF data). The HTML page only names Equifax, TransUnion and Experian. Membership on the CFPB list is therefore established only for the entries whose individual CFPB company-page URLs the search returned, and those pages were not opened.
- Several sources were search snippets, not opened pages. This is flagged where it applies.
- The research budget was exceeded, so several sector leads are recorded as gaps rather than verified.

## Which appear on the CFPB's list of consumer reporting companies?

### Takeaway
The CFPB's 2025 list (dated January 2025 by the CFPB) is only partly verified here. Two specialty consumer reporting companies with individual CFPB company-list pages surfaced in search and are absent from the census: Checkr and Milliman IntelliScript. The full list could not be read.

### Cited Findings
- The CFPB 2025 list is self-reported by companies, not verified by the Bureau, and is described as not exhaustive. Source: [CFPB 2025 list search summary, document URL](https://files-prod.consumerfinance.gov/f/documents/cfpb_consumer-reporting-companies_list_2025.pdf) (PDF, not readable by the fetch tool; facts from search summary only).
- The CFPB's HTML page for the 2025 list names only three nationwide consumer reporting companies (Equifax, TransUnion, Experian) and links a full PDF. Source: [CFPB 2025 consumer reporting company list page](https://www.consumerfinance.gov/data-research/research-reports/2025-consumer-reporting-company-list/) (opened, 2026-10-30).
- Checkr has a CFPB company-list entry. Source: [CFPB company list: Checkr](https://consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/checkr) (URL returned by search, page not opened).
- Milliman IntelliScript has a CFPB company-list entry, described as a service that gathers prescription purchase data to estimate applicants' mortality risk and supply risk scores. Source: [CFPB company list: Milliman IntelliScript](https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/milliman-intelliscript/) (URL returned by search, page not opened).

### Inferences
- The census is missing at least two CFPB-listed specialty CRAs (Checkr, Milliman IntelliScript). The full PDF needs a text-extraction pass (for example `pdftotext`) to test the whole list against the census; that step was not done.

### Gaps
- Full CFPB list membership vs. census: not completed (PDF unreadable here). A text-extracted copy of the 2025 list is needed.
- Whether a 2026 CFPB list edition exists: not checked.

## Which health-data, connected-car, tenant, employment and insurance data vendors are named by regulators or major reporting?

### Takeaway
Regulators and reporting name the following in these sectors: GM/OnStar driving data sold to consumer reporting agencies (FTC order, finalized 2026-01-14); RentGrow (FTC tenant screening case, 2026-07-09); LexisNexis Risk Solutions and Verisk as recipients of GM driving data (reporting and lawsuits from 2024); and Milliman and MIB as insurance underwriting data sources. Health-data sellers were named by the FTC mostly in older actions (Kochava, Gravy Analytics, BetterHelp, GoodRx); no 2025-2026 health-broker action was found.

### Cited Findings
- FTC finalized its order against General Motors, GM Holdings and OnStar on 2026-01-14. The complaint alleges GM sold precise geolocation and driving behavior data to third parties, including consumer reporting agencies, without informed consent; the order bars GM from sharing that data with consumer reporting agencies for five years. Source: [FTC press release page (node/327916), opened](https://www.ftc.gov/node/327916); the FTC page does not name the CRAs. Five-year and 20-year terms come from secondary coverage: [Mondaq summary](https://www.mondaq.com/unitedstates/dodd-frank-consumer-protection-act/1732502/ftc-finalizes-gmonstar-order-over-geolocation-data-practices) (search snippet, not opened).
- GM shared OnStar Smart Driver data with LexisNexis Risk Solutions and Verisk, which passed risk information to insurers, as reported in March 2024. GM stopped sharing as of 2024-03-20. Source: [Edmunds report on GM ending the program](https://edmunds.com/car-news/gm-killed-program-that-sold-driving-data-to-insurance-companies.html) (search snippet, not opened). Lawsuits from 2024 name GM, OnStar and LexisNexis, and some name Verisk. Source: [Communications Litigation Today, 2024-04-30](https://communicationslitigationtoday.com/article/2024/04/30/4-friday-class-actions-challenge-drivers-privacy-violations-by-gm-onstar-and-data-firms-2404290059) (search snippet, not opened).
- FTC announced a proposed $2.25M settlement with RentGrow on 2026-07-09 over FCRA and FTC Act violations (accuracy procedures, duplicated criminal and eviction records in its ScreeningWorks Pro product, and misleading dispute notices). Complaint filed in D.D.C., civil action 1:26-cv-02415. Source: [FTC press release, RentGrow (2026-07-09)](https://www.ftc.gov/news-events/news/press-releases/2026/07/rentgrow-pay-225-million-settle-ftc-allegations-company-violated-fair-credit-reporting-act-ftc-act) (URL confirmed via fetch of the law-firm summary and the FTC URL returned by search; the FTC page itself was not opened). Sources disagree on whether the stipulated order has been entered or is pending court approval. The FTC docket lists the case as pending.
- RentGrow's data source named in the complaint was LexisNexis Accurint. Source: [FTC RentGrow complaint PDF](https://www.ftc.gov/system/files/ftc_gov/pdf/RentGrow-Complaint.pdf) (URL returned by search, not opened); the claim is from the search summary.
- Milliman IntelliScript: prescription-history service used by insurers in underwriting; CFPB lists it as a consumer reporting company (see KQ1). Source: [CFPB company list: Milliman IntelliScript](https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/milliman-intelliscript/) (not opened); an FTC complaint (2008) describes it pulling five-year prescription histories: [FTC complaint PDF](https://www.ftc.gov/sites/default/files/documents/cases/2008/02/080212complaint_0.pdf) (URL returned by search, not opened).
- MIB Group, Inc. (formerly Medical Information Bureau) is a membership corporation owned by about 430 insurers and describes itself as a "nationwide specialty consumer reporting agency" under the FCRA. Source: [MIB consumer guide (English PDF)](https://www.mib.com/webcontent/consumer_guide_english.pdf) (URL returned by search, not opened; the self-description is from the search summary).
- Health-data sellers named by FTC in older actions: Kochava (sued 2022, ongoing per search summary) and Gravy Analytics (settled; alleged sale of location data with health-related characteristics), BetterHelp (health data, deception and unfairness), and the FTC's 2024 call to Congress on health data brokers. Sources: [Lawfare summary on GoodRx and health data brokerage](https://www.lawfaremedia.org/article/goodrx-health-data-brokerage-and-limits-hipaa) and [Healthcare IT News, FTC calls out health data brokers](https://www.healthcareitnews.com/news/ftc-calls-out-health-data-brokers) (both search snippets, not opened). Kochava and Gravy Analytics are in the census already.
- Tenant screeners named in FTC/CFPB actions: TransUnion Rental Screening Solutions (CFPB/FTC 2023, about $15M), First Advantage SafeRent (FTC order, $100,000 penalty), and RealPage (FTC accuracy allegations). Source: [Orrick/accountsrecovery summary of the 2026 RentGrow case, which lists the earlier cases](https://infobytes.orrick.com/2026-07-17/ftc-announces-proposed-2-25m-settlement-with-tenant-screening-company-over-alleged-fcra-violations/) (search snippet, not opened; First Advantage and RealPage are only named in the search summary, with no dated primary source found).
- Checkr (employment screening): a class action filed January 2026 alleges misreported criminal records. Source: [Top Class Actions, 2026-01-26](https://topclassactions.com/lawsuit-settlements/lawsuit-news/class-action-claims-checkr-misreported-criminal-records-in-background-checks) (search snippet; a plaintiff-side allegation, not a finding).

### Inferences
- The GM/OnStar recipient CRAs most likely include LexisNexis Risk Solutions (already in census as `lexisnexis-risk-solutions-fl`) and Verisk. Verisk's parent company is not in the census; only the `verisk.com` domain appears under `lead-intelligence`. The census is therefore incomplete for Verisk as a named parent.
- RentGrow is a regulator-named tenant screener missing from the census by both name and domain.
- The census has a 2023 TransUnion tenant-screening entry only through `trans-union`/`ctam-leadshare` (smartmove.us); the TransUnion rental-screening action is covered only through those entries.

### Gaps
- Automotive: no evidence gathered for Cambridge Mobile Telematics, Wejo, Otonomo, Carfax, AutoCheck (Experian), or Verisk as a parent. Not checked in this pass.
- Employment: First Advantage, Sterling Check (Sterling Infosystems), GoodHire, Certn, HireQuest and Accurate Background. Census grep found none (`Sterling Data Company LLC` is a different company). No primary URL was gathered for these.
- Health: no 2025-2026 regulator action naming a health-data broker was found. Optum/Ingenix, IQVIA (census has `iqvia-digital`, not the parent), and HealthVerity were not checked.
- Insurance: Verisk's ISO/ClaimSearch and CoreLogic Insurance were not checked beyond the census lead-intelligence and corelogic-credco rows.
- Tenant: Experian RentBureau and CoreLogic Rental Property Solutions were not checked by primary source.

## Which are absent from the census by name and domain?

### Takeaway
Confirmed-absent by name and domain, with evidence: RentGrow, Checkr, Milliman (IntelliScript), and MIB Group. Verisk Analytics is absent as a parent entity, but its domain appears under another row. Other candidates were not verified.

### Missing brokers

| Name | Website | Sector | Evidence URL | Date checked |
|---|---|---|---|---|
| RentGrow Inc. | Not verified (FTC complaint names RentGrow; domain not in census) | Tenant screening (FCRA CRA; FTC case 2026) | https://www.ftc.gov/news-events/news/press-releases/2026/07/rentgrow-pay-225-million-settle-ftc-allegations-company-violated-fair-credit-reporting-act-ftc-act | 2026-10-30 |
| Checkr, Inc. | checkr.com (not verified in search) | Employment background screening (CFPB-listed CRA) | https://consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/checkr | 2026-10-30 |
| Milliman, Inc. (IntelliScript) | milliman.com (domain seen in search results; not verified on the product page) | Insurance underwriting, prescription-history data (CFPB-listed CRA) | https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/milliman-intelliscript/ | 2026-10-30 |
| MIB Group, Inc. | mib.com | Insurance applicant underwriting data (FCRA specialty CRA) | https://www.mib.com/webcontent/consumer_guide_english.pdf | 2026-10-30 |
| Verisk Analytics (parent; ISO/driving data) | verisk.com (domain present in census only under lead-intelligence) | Insurance data, auto telematics recipient named in GM reporting | https://communicationslitigationtoday.com/article/2024/04/30/4-friday-class-actions-challenge-drivers-privacy-violations-by-gm-onstar-and-data-firms-2404290059 | 2026-10-30 |

Notes on the table:
- Checkr, Milliman and MIB evidence URLs were returned by search and not opened; the claims rest on the search summaries. Re-check before publishing.
- The Verisk row is partial: the company is named in lawsuits, not as a regulator finding.
- Sterling Check, First Advantage, Experian RentBureau, CoreLogic and the automotive candidates have no evidence URL and are excluded from the table (see Gaps).

### Inferences
- Four of the five table rows are absent from the census by both name and domain. Verisk is absent as a parent but its domain is in the census under a different company.

### Gaps
- The CFPB list was not fully checked against the census (PDF unreadable). Some entries may be missing beyond Checkr and Milliman.
- No brokers were confirmed as absent from the census in the automotive sector (Cambridge Mobile Telematics, Wejo, Otonomo, Carfax, AutoCheck) because no evidence URL was gathered.
