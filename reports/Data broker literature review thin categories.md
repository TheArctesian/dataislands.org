# Data broker literature review: thin categories

Checked 31 October 2026. This is the second search, aimed at the categories the [first review](Data%20broker%20literature%20review.md) left thin. All 84 usable sources are in `data/literature/sources-round-2.csv`. None shares a URL or DOI with `data/literature/sources.csv`.

**How far to trust this.** Each key source is tagged by how it was read:

- **Full text:** the whole page or document. This can be a press release, not the report behind it.
- **Abstract:** an abstract page or an OpenAlex record.
- **Preview:** only the opening, a landing or summary page, or selected passages.

Most web pages were read through a summarising tool, so check quotes and figures against the source before publishing. Lawsuits and agency complaints are allegations unless a court has decided them, and most settlements here are not admissions.

## Most useful findings

1. **Private background checks show high error rates in an independent test.** For 101 people, [regulated checks had at least one false positive for 60% and unregulated checks for 50%](https://doi.org/10.1111/1745-9125.12359). At least one false negative appeared for 90% and 92% (abstract).
2. **Insurers use many outside data sources and rarely say so.** An [NAIC survey](https://content.naic.org/sites/default/files/inline-files/PP%20Auto%20Survey%20Team%20Report%20120822.pdf) listed 104 third-party data sources. On voluntary disclosure of data elements for rating, 23 said yes, 49 no and 121 left it blank. It covers AI/ML models only (full text).
3. **New identifiers have replaced much of what cookies did.** A preprint found [extended identifiers on 83.76% of studied sites by May 2025](https://arxiv.org/abs/2609.02069), with 12 of 18 providers creating persistent IDs (full text). Two authors work at ad-verification firms.
4. **A credit bureau's data reached a health data company.** STAT reports [IQVIA bought financial and demographic data from Experian](https://www.statnews.com/2022/07/28/top-iqvia-lawyer-declines-to-discuss-experian-relationship-but-pledges-privacy/) on tens of millions of Americans (preview).
5. **Utility header data travelled a long way.** Sen. Wyden says [NCTUE let Equifax resell header data on 171 million people](https://www.cdiaonline.org/wp-content/uploads/2021/12/Senator-Wyden-Letter-to-Chopra-on-Credit-Header.pdf), and that brokers keep selling what they already bought (full text). This is his account of his own inquiry.
6. **Evidence also limits the harm story.** The Second Circuit found [CoreLogic did not cause the housing denial](https://infobytes.orrick.com/wp-content/uploads/CFHC-v-CoreLogic-Rental-Prop-2ndCir-02202026.pdf) in one screening case (preview). A systematic review found [only one attack on health data de-identified to standards, succeeding at a rate of 0.00013](https://doi.org/10.1371/journal.pone.0028071) (full text).

## Insurance and auto

- **Connected cars.** The [FTC's final GM order](https://www.ftc.gov/node/327916) bars GM for five years from giving geolocation and driver behavior data to consumer reporting agencies. It also requires express consent, with limited exceptions, plus deletion and opt-out routes (full text). It settles allegations.
- **The alleged pipeline.** The [Arkansas Attorney General alleges](https://arkansasag.gov/news-release/attorney-general-griffin-sues-general-motors-and-onstar-for-deceiving-arkansans-and-unlawfully-selling-data/) that driving data reached insurers, who denied coverage or raised rates (full text). The release names no broker. [Claims Journal's account of the complaint](https://www.claimsjournal.com/news/national/2025/03/03/329227.htm) names Verisk (full text). Later status was not found.
- **Price of the data.** [EFF's readout of a senators' letter](https://www.eff.org/deeplinks/2024/07/senators-expose-car-companies-terrible-data-privacy-practices) says Verisk paid Honda about 26 cents per car and Hyundai about 61 cents (full text). The letter itself could not be read.
- **Phone apps.** The Texas complaint alleges [an Arity SDK in apps gathered trip data](https://www.theregister.com/2025/01/14/allstate_accused_of_paying_app/) later used to justify rate rises or dropped cover. Allstate's spokesperson says Arity helps with accurate pricing after consent (full text). In a separate private suit, [wiretap and FCRA claims survived a pleading-stage ruling](https://natlawreview.com/article/massive-win-plaintiffs-federal-court-keeps-wiretap-and-fcra-claims-alive), described by an author whose tone favors plaintiffs (full text).
- **Credit-based scores.** The [FTC in 2007](https://www.ftc.gov/reports/credit-based-insurance-scores-impacts-consumers-automobile-insurance-report-congress-federal) found scores predict risk and differ across racial and ethnic groups (preview). [CFA, an advocate](https://consumerfed.org/report-details-severe-credit-score-penalties-in-auto-insurance/), says clean-record drivers paid $470 on average with excellent credit and $1,012 with poor credit (release read in full; report not read).
- **Consumer route.** The [CFPB's listing](https://consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/comprehensive-loss-underwriting-exchange) sets out free reports, freezes and disputes for LexisNexis C.L.U.E. and Telematics OnDemand (full text).
- **Limited context.** A [European experiment](https://doi.org/10.1057/s41264-026-00392-5) found discounts and services substantially offset the stated privacy cost of telematics (abstract). It says nothing about US data sales.

## Identity, ad tech and marketing

- **A ready taxonomy.** [Sivan-Sevilla and colleagues](https://policyreview.info/articles/analysis/cookie-less-identification-foragainst-privacy) sort identifiers into Universal, Onboarding and Walled Garden IDs. They conclude UID2 and RampID keep cross-site tracking in some form and offer doubtful opt-out (full text).
- **How an identity graph works.** [Cracked Labs](https://crackedlabs.org/en/identity-surveillance) describes how AbiliTec and RampID link people and devices, from public documentation it warns may be incomplete (preview). Its scale figures are about 700 million people and a LiveRamp-stated 60 billion daily transmissions. The focus is Europe.
- **Legal records.** Oracle funds a [$115 million class settlement](https://classaction.org/media/katz-lacabe-et-al-v-oracle-america-inc-settlement-agreement.pdf) covering ID Graph and Data Marketplace, and denies the allegations (full text). This is private litigation. Separately, [DOJ's case page on Epsilon](https://www.justice.gov/civil/case/epsilon) records a $150 million deferred prosecution agreement over data sold to clients linked to mail fraud (full text).
- **Syncing and bidstream sharing.**
  - [97% of 850 mobile users](https://arxiv.org/abs/1805.10505) were exposed to cookie syncing (abstract).
  - A model estimates [52 companies could together see at least 91%](https://petsymposium.org/popets/2018/popets-2018-0033.php) of a user's browsing history. This is a modelled bound, not an observed flow (abstract).
  - [Server-side links that sync detection misses](https://petsymposium.org/popets/2020/popets-2020-0005.php) mean any client-side map is a lower bound (abstract).
  - Browsing history elements [sold for fractions of a cent in 2014](https://www.ndss-symposium.org/ndss2014/programme/selling-privacy-auction/). Treat this as history (abstract).
- **Email as an identifier.** [About 30% of emails passed the recipient's address](https://petsymposium.org/popets/2018/popets-2018-0006.php) to a third party when viewed (abstract). A crawl found [emails sent before form submission on 2,950 sites from the US](https://www.usenix.org/conference/usenixsecurity22/presentation/senol) and 1,844 from the EU (abstract). [Custom-audience uploads could be exploited](https://doi.org/10.1109/sp.2018.00014) to infer phone numbers, though that specific attack was fixed (abstract).
- **Accuracy is weakly evidenced.** [Truthset says email-to-postal links were right 51% of the time](https://www.adweek.com/adweek-wire/massive-study-on-matching-households-and-email-addresses-finds-range-of-inaccuracies/), but it sells validation services and names no provider (full text). [Adalytics claims Colossus misdeclared IDs](https://www.adexchanger.com/online-advertising/adalytics-claims-colossus-ssp-is-injecting-fake-ids-into-its-bid-requests/), and Colossus and BidSwitch each deny responsibility (full text). [AdExchanger](https://www.adexchanger.com/marketers/programmatic-companies-wrestle-with-id-bridging-and-what-counts-as-fraud) gives a usable definition of ID bridging from industry voices (full text).

## Employment and tenant screening, and property

- **Tenant files, enforcement.**
  - The FTC and CFPB alleged [Trans Union showed one case as several evictions and dismissed cases as filed or as landlord wins](https://www.ftc.gov/news-events/news/press-releases/2023/10/ftc-cfpb-settlement-require-trans-union-pay-15-million-over-charges-it-failed-ensure-accuracy-tenant), settling for $15 million (full text).
  - The newest case is a [proposed $2.25 million penalty against RentGrow](https://infobytes.orrick.com/2026-07-17/ftc-announces-proposed-2-25m-settlement-with-tenant-screening-company-over-alleged-fcra-violations/) over alleged duplicate entries and dispute failures. The company neither admits nor denies, and court approval is unconfirmed (full text). The [FTC release](https://www.ftc.gov/news-events/news/press-releases/2026/07/rentgrow-pay-225-million-settle-ftc-allegations-company-violated-fair-credit-reporting-act-ftc-act) is the better citation.
- **Tenant files, complaints.** The [CFPB](https://www.consumerfinance.gov/about-us/newsroom/cfpb-reports-highlight-problems-with-tenant-background-checks) reports over 24,000 complaints, more than 16,000 about incorrect information (press release read in full; reports not read).
- **How reports shape decisions.** In an experiment, [landlords conflated eviction filings with evictions and deferred to scores](https://doi.org/10.1080/10511482.2022.2113815) (abstract). Interviews show [algorithmic screening requires exceptions to be codified in advance](https://doi.org/10.1086/739108) (abstract). A [law review article](https://doi.org/10.70167/amrl0503) frames the effect as a lasting "Scarlet E" (preview).
- **Limit on liability.** In [CFHC v. CoreLogic](https://infobytes.orrick.com/wp-content/uploads/CFHC-v-CoreLogic-Rental-Prop-2ndCir-02202026.pdf), private litigation, the Second Circuit found no standing for the housing group and no prima facie disparate-impact case. It also reversed FCRA liability (preview: syllabus and passages).
- **Employment.** All four items are secondary or unproven, and three date from 2012 to 2019.
  - [$10.5 million plus a $2.5 million penalty](https://www.subjecttoinquiry.com/2015/11/cfpb-takes-action-under-fcra-against-employment-background-check-providers/) for two screeners, where the CFPB cited no written common-name procedures (full text).
  - [Sterling's $8.5 million CFPB settlement](https://thewbkfirm.com/industry/cfpb-settles-with-background-screening-company-for-8-5m-to-resolve-alleged-fcra-violations) (full text).
  - [HireRight's proposed $2.6 million FTC order](https://www.hunton.com/privacy-and-cybersecurity-law-blog/2012/08/articles/ftc-fines-employee-background-screening-company-2-6-million-for-alleged-fcra-violations/) (full text).
  - An [unproven class complaint against Checkr](https://topclassactions.com/lawsuit-settlements/lawsuit-news/class-action-claims-checkr-misreported-criminal-records-in-background-checks) (full text).
  - Only the landing page of a [GAO report on criminal records](https://ecommons.cornell.edu/handle/1813/77774) was read, so none of its conclusions are used (preview).
- **Property and home buying.** No independent investigation of property record resale was found. The nearest items are an antitrust settlement [limiting RealPage's use of rivals' nonpublic data](https://www.justice.gov/opa/pr/justice-department-requires-realpage-end-sharing-competitively-sensitive-information-and), proposed and subject to court approval (full text), and a [coalition letter on mortgage trigger leads](https://consumerfed.org/wp-content/uploads/2025/04/4.17.25-Trigger-Leads-Coalition-letter-S1467-HR2808.pdf), which concerns credit data rather than property data (full text).

## B2B and investor data

- **Clickstream supply.** A pseudonymous researcher [flagged 287 Chrome extensions with about 37.4 million installs](https://www.theregister.com/2026/02/11/security_researcher_287_chrome_extensions_data_leak/) leaking visited URLs. This is one unreviewed report covered by the press (full text of the article). Globes reports [Similarweb's earlier collection breached Google and Mozilla terms](https://en.globes.co.il/en/article-similarwebs-controversial-route-to-wall-street-1001376912). Similarweb calls the allegations groundless (full text).
- **Investor-data enforcement.** The [SEC's App Annie case](https://www.sec.gov/newsroom/press-releases/2021-176) was, by the SEC's account, its first charging an alternative data provider with securities fraud. App Annie agreed to a $10 million penalty (full text of the release). The harm is to data suppliers and investors, not consumers directly.
- **Business credit files.** The [FTC alleged D&B gave businesses no clear way to fix errors](https://www.ftc.gov/news-events/press-releases/2022/01/response-ftc-charges-dun-bradstreet-clean-small-business-credit) (full text). A later report says [D&B agreed to pay $5.7 million](https://www.grcreport.com/post/dun-bradstreet-faces-5-7-million-penalty-for-failing-to-honor-ftc-order) over alleged breaches of that order, about sales practices (full text). These concern business files, not personal data.
- **Consent over profiles.**
  - ZoomInfo [proposed settling publicity suits at an estimated $26 million to $29 million](https://columbian.com/news/2024/feb/27/vancouver-tech-company-zoominfo-proposes-settlement-of-up-to-29-million-in-right-to-publicity-lawsuits/), and final approval was not verified (full text).
  - A judge [refused to dismiss a consent suit in 2025](https://www.mealeys.com/mealeys/articles/2340128) at the pleading stage (preview).
  - The [Martinez panel opinion](https://cdn.ca9.uscourts.gov/datastore/opinions/2023/09/21/22-35305.pdf) describes pleaded facts on teaser profiles and contributed contacts (full text). Search results report it was vacated, so it is not precedent.
- **Collection routes and breach.** [Apollo.io and Seamless.AI pages vanished from LinkedIn](https://martech.org/a-pair-of-lead-gen-providers-have-disappeared-from-linkedin/) in 2025, and LinkedIn gave no reason in the article, so do not state a scraping ban (full text). [Apollo confirmed theft from a database of about 200 million contacts](https://www.infosecurity-magazine.com/news/apollo-faces-criticism-for-breach) in 2018, as reported citing TechCrunch (full text).
- **Scraping law.** [Commentary on hiQ](https://www.fbm.com/publications/what-recent-rulings-in-hiq-v-linkedin-and-other-cases-say-about-the-legality-of-data-scraping/) says the CFAA does not reach public data while contract claims remain (full text). [Lowenstein on Meta v. Bright Data](https://www.lowenstein.com/news-insights/publications/client-alerts/meta-v-bright-data-ruling-has-important-implications-for-webscraping-activities-by-investment-advisers-im) tells advisers to run diligence on scraped-data vendors (full text). A [student Note](https://repository.law.umich.edu/mlr/vol120/iss5/5/) argues the CPRA leaves scrapers largely unregulated (abstract). These are commentary, not opinions.
- **Panel accuracy.** [Most European tracking-panel participants had untracked devices or browsers](https://doi.org/10.1080/19312458.2024.2393165) (abstract). It did not test Similarweb or Comscore. The only Comscore-specific item dates from [2008](https://www.theregister.com/2008/05/12/inside_comscore/) and is history only (full text).

## Credit, fraud and ID verification

- **Credit header.** Beyond the Wyden letter, the [Washington Post, read on a repost](https://nnirr.org/?p=7553), reports NCTUE agreed to stop licensing while earlier data stayed available (full text). [Advocates](https://www.nclc.org/wp-content/uploads/2022/10/credit_headers_ICE_ltr.pdf) argue a header list can hint at immigration status and that the CFPB could close the gap. The 2022 date is inferred (full text). A [1997 filing](https://privacyrights.org/resources-tools/advocacy/availability-sensitive-information-about-consumers-and-its-possible-use) shows the opt-out gap is old (full text). No peer-reviewed study of this market turned up.
- **Sales to government.**
  - The Intercept reported a [$16.8 million ICE contract with LexisNexis](https://theintercept.com/2021/04/02/ice-database-surveillance-lexisnexis/). LexisNexis says the tool holds mainly public records (full text).
  - [LawSites later gives $22.1 million](https://www.lawnext.com/2026/04/the-legal-tech-giants-powering-ice-part-1-how-thomson-reuters-and-lexisnexis-helped-support-americas-immigration-surveillance-machine.html) and reports CLEAR access renewed on a sole-source basis. Thomson Reuters says CLEAR lacks citizenship and immigration status data (full text). Check both figures on USAspending.
  - Plaintiffs' counsel reports a [$27.5 million private settlement over CLEAR](https://www.cohenmilstein.com/case-study/brooks-et-al-v-thomson-reuters/) (full text).
  - Two scholarly pieces argue against this use: [Needle and Rubel](https://doi.org/10.1177/20539517251351323) and [Guerrero](https://doi.org/10.24908/ss.v24i4.17737) (both abstract).
- **ID.me.** [GAO finds ID.me is the IRS's only provider at its second assurance level](https://www.gao.gov/products/gao-25-107273), and that the IRS could not show measurable goals or documented routine reviews (preview: product page). [House investigators found waits longer than ID.me told the IRS](https://cyberscoop.com/idme-irs-identity-verification-congress/). ID.me calls criticism of its fraud assessment premature and says delays were temporary (full text of secondary coverage).
- **Socure.** A [state senator's letter](https://statescoop.com/wp-content/uploads/sites/6/2024/08/Sen.-Cooney-Letter-of-Concern-re_-Fraud-Protection.docx.pdf) asks questions and cites allegations. It makes no findings (full text). [Socure replies](https://www.biometricupdate.com/202408/socure-explains-identity-verification-compliance-to-2-state-lawmakers) that it is not a data broker under New York law and does not sell data (full text). Neither settles how to classify it.
- **Unequal verification.** [Of five commercial remote ID checks tested on 3,991 subjects](https://arxiv.org/abs/2409.12318), two were equitable across demographics and one had higher false rejections for Black participants and darker skin tones (abstract). Vendors are unnamed, so do not attribute this to any company.
- **Bureau marketing.** The only item is the [FTC's 2000 Trans Union ruling](https://www.ftc.gov/node/40296) that target marketing lists were consumer reports (full text). It says nothing about current products.

## Health and breach data

- **Commercial linkage.** STAT reports [Quintiles linked de-identified GE Healthcare records to insurance claims](https://www.statnews.com/2022/05/23/hipaa-patient-ge-data-privacy-profit/), and that a confidential memo raised privacy concerns (preview). Both STAT pieces are paywalled.
- **How the business works.** A [Canadian JAMA Network Open study](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2833520) describes two broker models, selling de-identified analytics and flagging patients for a sponsor's drug (nearly full text, last section unread). Use it as a comparison, not US evidence.
- **Re-identification is mixed.** [Sweeney matched 35 of 81 sampled cases](https://arxiv.org/abs/1307.1370v2) in nameless Washington State data bought for $50 (abstract). The [El Emam review](https://doi.org/10.1371/journal.pone.0028071) says the evidence cannot settle how well de-identification works, and its authors declare consulting on de-identification (full text). [McGraw](https://doi.org/10.1136/amiajnl-2012-000936) notes data de-identified under HIPAA leaves the rule, with scarce published evidence of re-identifying properly de-identified data (abstract).
- **Upstream and legal limits.** Reporting from about 2013 says [at least 26 states sold hospital records](https://www.healthdatamanagement.com/news/states-review-rules-after-patients-identified-via-health-records). The count is dated and the year inferred (full text). [Sorrell v. IMS Health](https://news.bloomberglaw.com/privacy-and-data-security/supreme-court-strikes-down-vermont-prescription-data-mining-law-1) struck down Vermont's limits on prescriber data, as reported (full text). [Patient support programs](https://doi.org/10.52214/stlr.v23i1.9390) collect data through HIPAA authorizations (abstract).
- **FTC cases are ad-tech flows, not broker sales.** The FTC alleged disclosures by [GoodRx](https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising), [BetterHelp](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook) and [Cerebral](https://www.ftc.gov/news-events/news/press-releases/2024/04/proposed-ftc-order-will-prohibit-telehealth-firm-cerebral-using-or-disclosing-sensitive-data) (all full text). Keep them apart from broker evidence.
- **Breach data.** The best item is the 2020 report that [SpyCloud sells police access to breached data](https://www.vice.com/en/article/police-buying-hacked-data-spycloud), based on slides SpyCloud confirmed (full text). It is a breach-data vendor, not a registered consumer broker. Nothing found shows a registered broker buying infostealer logs, which is an evidence gap and not proof the flow does not happen.

## Evidence by category

Ratings reflect only what these searches found. **Good** means several independent or primary sources. **Partial** means real evidence with a clear limit in age, scope or source type. **Thin** means little or nothing independent.

| Category | Rating | What is still missing |
|---|---|---|
| Connected-car driving data | Partial | The Wyden-Markey letter, the Arkansas and Texas complaints, and status of each suit. Pipeline facts are mostly allegations |
| Insurer use of outside data | Partial | Anything beyond the NAIC survey's AI/ML scope and blank answers |
| Credit-based insurance scores | Partial | The full FTC and CFA reports, and evidence newer than 2007 from a neutral source |
| Accuracy of driving scores and C.L.U.E. files | Thin | No independent study found |
| Insurance data market size | Thin | Only per-car prices via EFF |
| Cookie syncing and bidstream sharing | Good | Current measurement; much of it predates the post-cookie shift and names no brokers |
| Email as an identifier | Good | Links from email leakage to named identity graphs |
| Identity graphs and extended IDs | Partial | Peer review of the preprint, plus RampID and UID2 prevalence |
| ID bridging | Thin | No peer-reviewed measurement |
| Marketing data accuracy | Thin | Independent tests naming vendors (see also the first review) |
| Oracle, Epsilon, Acxiom operations | Partial | Technical measurement. Oracle and Epsilon evidence is legal records; Acxiom has none of its own |
| Tenant screening | Good | The underlying CFPB reports and court entry of the RentGrow order |
| Employment screening | Partial | Primary agency records, recent cases and independent evidence naming vendors |
| Checkr, First Advantage | Thin | Checkr has one unproven complaint. No First Advantage item met the bar |
| Property record resale (CoreLogic/Cotality, ATTOM) | Thin | No independent investigation found |
| Mortgage trigger leads | Thin | One mixed coalition letter; enactment unconfirmed |
| Landlord data pooling | Partial | Final entry of the RealPage settlement |
| Business credit files (D&B) | Partial | The 2025 FTC release; finalization of the 2022 order |
| B2B contact consent (ZoomInfo) | Partial | Dockets, settlement approval and later case status |
| B2B contact accuracy, Clearbit | Thin | No independent evidence found |
| Clickstream and web panels | Partial | The underlying extension report and any recent Comscore or Similarweb test. Avast/Jumpshot was not verified |
| Alternative data market and enforcement | Thin | No independent market size; one SEC case, order not read |
| Credit header | Partial | Peer-reviewed study, current Experian and TransUnion sales, and confirmation of current federal status |
| Bureau marketing products | Thin | Nothing recent and independent |
| Sales to government (ICE) | Good | Reconciled contract values from USAspending |
| ID.me | Good | The GAO and House reports themselves |
| Socure, Jumio | Thin | No agency finding or independent evaluation naming either |
| Remote ID bias | Partial | One abstract-level study with unnamed vendors |
| Health ad-tech disclosures | Good | Final orders; these are not broker sales |
| De-identification and re-identification | Good | Recent work. Sources are old but cover both sides |
| IQVIA and commercial health data | Partial | Full STAT articles, read past the paywall |
| US pharmacy data resale, 2024-2026 | Thin | Nothing strong and independent found |
| Breach data in broker products | Thin | No evidence naming a registered broker |

## Ownership compared with the atlas

Compared with `data/ownership/ownership.json` on 31 October 2026. Nothing was edited.

**Differs from the atlas, or needs a check**

- **Acxiom.** The atlas lists Omnicom as owner (`needs_check`) and keeps LiveRamp separate. [Cracked Labs mentions Acxiom only as LiveRamp's former name](https://crackedlabs.org/en/identity-surveillance). That does not disprove Omnicom, which a search summary also reported but no opened page confirmed. Keep the flag.

**Adds to the atlas, without giving an owner**

- **Similarweb** (owner unknown). [Globes reports it bought the Stylish extension](https://en.globes.co.il/en/article-similarwebs-controversial-route-to-wall-street-1001376912). That is an acquisition by Similarweb, and it says nothing about who owns Similarweb.
- **NCTUE** (owner unknown). [Wyden's letter refers to utilities on its board](https://www.cdiaonline.org/wp-content/uploads/2021/12/Senator-Wyden-Letter-to-Chopra-on-Credit-Header.pdf), and the [Post refers to members](https://nnirr.org/?p=7553). This is governance, not proof of ownership.
- **SafeRent Solutions** (owner unknown). [Freedman's notes refer to CoreLogic's SafeRent Score](https://doi.org/10.70167/amrl0503), and the [Second Circuit names CoreLogic Rental Property Solutions](https://infobytes.orrick.com/wp-content/uploads/CFHC-v-CoreLogic-Rental-Prop-2ndCir-02202026.pdf), which the atlas does not list. This suggests a past link only. Do not carry over the atlas's Cotality owner for Corelogic Credco on this basis.
- **IQVIA lineage.** The sources label [Quintiles](https://www.statnews.com/2022/05/23/hipaa-patient-ge-data-privacy-profit/) and [IMS Health](https://news.bloomberglaw.com/privacy-and-data-security/supreme-court-strikes-down-vermont-prescription-data-mining-law-1) as now IQVIA. That label was not on the pages read, so treat it as unconfirmed. The atlas has neither name.
- **Experian to IQVIA.** This is [a reported data flow](https://www.statnews.com/2022/07/28/top-iqvia-lawyer-declines-to-discuss-experian-relationship-but-pledges-privacy/), not ownership, and belongs in a separate link type.
- **Colossus SSP and Direct Digital Holdings.** [The article names both](https://www.adexchanger.com/online-advertising/adalytics-claims-colossus-ssp-is-injecting-fake-ids-into-its-bid-requests/), and neither is in the atlas. Their relationship was not recorded in this check, so read the article first.

**Consistent, or no new evidence**

- **Arity.** The atlas has Arity 875, LLC under Allstate. The [Register piece](https://www.theregister.com/2025/01/14/allstate_accused_of_paying_app/) carries Allstate's response on Arity, which fits but is not ownership proof.
- **Dun & Bradstreet and HireRight.** The atlas now shows Clearlake, and General Atlantic with Stone Point. The new items say nothing on ownership.
- **Epsilon and KBM Group.** Both remain unknown in the atlas, and the [DOJ page](https://www.justice.gov/civil/case/epsilon) as summarised does not fill the gap.

**Names not to merge without checking**

These pairs look alike, but no source here shows they are the same company:

- Sterling Infosystems and the atlas's Sterling Data Company LLC
- General Information Services and General Information Solutions LLC
- Apollo.io and Apollo Interactive, LLC
- Seamless.AI and Seamless Contacts, Inc.

**No broker entry of their own under these names**

RentGrow, RealPage, Socure, ID.me, Jumio, Cambridge Mobile Telematics, Bright Data, App Annie and Truthset do not appear anywhere in the file. Verisk, Thomson Reuters and Checkr appear only as owners or in evidence for other entries, such as ISO Claims Services, West Publishing and Inflection.com. Whether any belong in the census is a scope question for you.

## Findings resting on one source

Repeat these only with attribution, and check them first:

- [NAIC: 104 third-party sources](https://content.naic.org/sites/default/files/inline-files/PP%20Auto%20Survey%20Team%20Report%20120822.pdf) and its disclosure counts.
- [Lageson and Stewart: background check error rates](https://doi.org/10.1111/1745-9125.12359), on 101 people (abstract).
- [Bridging the Gap: 83.76% of sites](https://arxiv.org/abs/2609.02069), an unreviewed preprint.
- [Wyden: 171 million people](https://www.cdiaonline.org/wp-content/uploads/2021/12/Senator-Wyden-Letter-to-Chopra-on-Credit-Header.pdf). The wider flow is corroborated by the Post, but this figure was not checked there.
- [STAT: the Experian to IQVIA link and 120 million people](https://www.statnews.com/2022/07/28/top-iqvia-lawyer-declines-to-discuss-experian-relationship-but-pledges-privacy/) (preview).
- [EFF: per-car prices](https://www.eff.org/deeplinks/2024/07/senators-expose-car-companies-terrible-data-privacy-practices), a readout of an unread letter.
- [Claims Journal: the 2015 GM agreement with Verisk](https://www.claimsjournal.com/news/national/2025/03/03/329227.htm), as alleged.
- [CFA: $470 versus $1,012](https://consumerfed.org/report-details-severe-credit-score-penalties-in-auto-insurance/), from an advocate.
- [Truthset: 51% accuracy](https://www.adweek.com/adweek-wire/massive-study-on-matching-households-and-email-addresses-finds-range-of-inaccuracies/), a vendor's self-report.
- [Adalytics on Colossus](https://www.adexchanger.com/online-advertising/adalytics-claims-colossus-ssp-is-injecting-fake-ids-into-its-bid-requests/), contested and unadjudicated.
- [Cracked Labs: 700 million people and 60 billion transmissions](https://crackedlabs.org/en/identity-surveillance), from a landing page; the 60 billion is LiveRamp's own figure.
- [The Register: 287 extensions](https://www.theregister.com/2026/02/11/security_researcher_287_chrome_extensions_data_leak/), one researcher.
- [So: landlord automation bias](https://doi.org/10.1080/10511482.2022.2113815) (abstract).
- [Fatima et al.: uneven remote ID checks](https://arxiv.org/abs/2409.12318) (abstract).
- [GAO: ID.me as the IRS's only provider at that level](https://www.gao.gov/products/gao-25-107273), authoritative but one document.
- [Health Data Management: 26 states](https://www.healthdatamanagement.com/news/states-review-rules-after-patients-identified-via-health-records), dated.
- [Infosecurity: the Apollo breach](https://www.infosecurity-magazine.com/news/apollo-faces-criticism-for-breach), itself citing TechCrunch.

## Unreachable items: unverified and not relied on

None of these was read, and no finding above rests on them.

- **[Wyden-Markey letter to the FTC](https://www.wyden.senate.gov/imo/media/doc/wyden-markey_auto_privacy_letter_to_ftc.pdf)** (HTTP 403). Unverified: search summaries report that Verisk paid Honda $25,920 for data on about 97,000 cars and Hyundai about $1.04 million for 1.7 million vehicles.
- **[Rockefeller letters to data brokers on vulnerability-based marketing](https://www.commerce.senate.gov/2014/2/rockefeller-presses-data-brokers-for-details-on-vulnerability-based-marketing-tools)** (HTTP 403). Unverified: search summaries say the committee chair wrote to six brokers. Check the names against the release.
- **[Truby, Brown and Ibrahim on regulating vehicle telematics](https://doi.org/10.1080/13600869.2023.2242671)** (HTTP 403). Unverified: known from title and Crossref metadata only, with no abstract.
