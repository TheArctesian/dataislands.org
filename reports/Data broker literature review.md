# Data broker literature review

Checked 31 October 2026. Every usable source is listed in `data/literature/sources.csv`.

**How far to trust this.** Much of this evidence was read only as an abstract, a landing page or a preview, and page reading often went through a summarising tool. Check any figure or quote against the full source before publishing it. The items marked "abstract record" below were checked only against an OpenAlex or Crossref abstract, because the publisher's page could not be read.

## Most useful findings

1. **Registered brokers mostly do not offer a clean way to exercise rights.** Only [9% of 522 California-registered brokers](https://doi.org/10.1145/3805689.3812413) fully met transparency requirements. In a sample of 250, 43% made it impossible to exercise all rights (abstract record).
2. **Paying for removal is weak value.** In a Consumer Reports test, [only 35% of 332 profile instances came down](https://innovation.consumerreports.org/wp-content/uploads/2024/08/Data-Defense_-Evaluating-People-Search-Site-Removal-Services-.pdf) within four months. Manual opt-outs reached 70%, but only four people tried them.
3. **The atlas has an out-of-date owner.** [Clearlake bought Dun & Bradstreet on 26 August 2025](https://www.sec.gov/Archives/edgar/data/1799208/000110465925082892/tm2524330d1_ex99-1.htm), and the atlas still treats D&B as the top owner. See [the conflicts list](#ownership-findings-that-conflict-with-the-atlas).
4. **State registries are neither complete nor fully accurate.** Cross-matching found [hundreds of companies missing from each state's list](https://privacyrights.org/resources-tools/reports/why-are-hundreds-data-brokers-not-registering-states), and California's regulator has [warned about incorrect registry filings](https://privacy.ca.gov/2026/09/enforcement-advisory-targets-incorrect-information-in-data-broker-registration/). The atlas should say so.
5. **Federal rules are thin, and state laws leave a large gap.** The CFPB [withdrew its proposed broker rule](https://www.federalregister.gov/documents/2025/05/15/2025-08644/protecting-americans-from-harmful-data-broker-practices-regulation-v-withdrawal-of-proposed-rule), and [all 19 general state privacy laws exempt FCRA-covered and GLBA-covered data](https://epic.org/wp-content/uploads/2025/07/EPIC-Unbridled-and-Underregulated-July2025-1.pdf).
6. **Purchased location data is not anonymous in practice.** Researchers who bought five datasets could [infer home and work locations and reveal identities](https://doi.org/10.1109/acsac67867.2025.00099) (abstract record).

## Definitions and taxonomy

- **Baseline.** The FTC's [2014 study of nine brokers](https://www.ftc.gov/system/files/documents/reports/data-brokers-call-transparency-accountability-report-federal-trade-commission-may-2014/140527databrokerreport.pdf) remains the sector baseline. It found collection largely without consumers' knowledge, and seven of the nine buying and selling among themselves.
- **Literature map.** [Reviglio's review](https://doi.org/10.14763/2022.3.1670) calls the industry under-researched and under-regulated, and proposes legal definitions of data brokers. Its scope goes beyond the US.
- **Broad definitions.** An [airline-owned broker sold passenger data to CBP](https://www.404media.co/airlines-dont-want-you-to-know-they-sold-your-flight-data-to-dhs/), which argues for including industry-owned clearinghouses. Only the article's preview was read.
- **Public versus sensitive.** ODNI's advisers say [publicly available information is no longer a good proxy for non-sensitive information](https://archive.dni.gov/files/ODNI/documents/assessments/ODNI-Declassified-Report-on-CAI-January2022.pdf). Verify the panel title and declassification date before citing them.
- **Credit-law boundary.** [Mierzwinski](https://law-journals-books.vlex.com/vid/lists-digital-role-credit-reporting-act-507488278) argued in 2013 that profiling blurs marketing and credit decisions, so many practices belong under the FCRA or a parallel regime. Only an excerpt was read. EPIC's [data-level versus entity-level distinction](https://epic.org/wp-content/uploads/2025/07/EPIC-Unbridled-and-Underregulated-July2025-1.pdf) could be adopted directly in the regulation layer.
- **Node types worth adding.**
  - Shared operators: [four groups run 14 of 20 people-search sites studied](https://petsymposium.org/popets/2024/popets-2024-0118.php).
  - Affiliate funnels: [front sites that send visitors to paid brokers](https://krebsonsecurity.com/2024/03/the-not-so-true-people-search-network-from-china/). The attribution is suspected, and the paid brokers are not accused of running the network.
  - Removal services with broker ties: see [the OneRep reporting](https://krebsonsecurity.com/2024/03/ceo-of-data-privacy-company-onerep-com-founded-dozens-of-people-search-firms/).
  - Bidstream collectors: see [the FTC's Mobilewalla case](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-takes-action-against-mobilewalla-collecting-selling-sensitive-location-data).

## Ownership

**Changes that alter old evidence**

| Company | What the source shows | Status |
|---|---|---|
| Dun & Bradstreet | [Clearlake completed the purchase, and NYSE trading ended](https://clearlake.com/news/clearlake-completes-acquisition-of-dun-bradstreet/) | Complete, 26 August 2025 |
| ISS STOXX | [Deutsche Börse agreed to buy the remaining 20%](https://www.deutsche-boerse.com/dbg-en/media/news-stories/press-releases/Deutsche-B-rse-Group-to-Acquire-General-Atlantic-s-Minority-Stake-in-ISS-STOXX-4948682) | Exit expected March 2026, completion unconfirmed |
| Infutor and Jornaya | [Verisk sold the unit to Five Elms-backed ActiveProspect](https://stocks.observer-reporter.com/observerreporter/article/gnwcq-2026-1-8-verisk-announces-sale-of-its-marketing-solutions-business-to-activeprospect) | Announced 8 January 2026 |
| Vericast family | [Chatham-owned RRD agreed to buy digital and print businesses](https://www.lowenstein.com/news-insights/firm-news/lowenstein-represents-chatham-asset-management-sole-owner-of-rr-donnelley-sons-in-purchase-of-digital-print-and-marketing-businesses-from-vericast), including [the Valassis print business, while Vericast kept Harland Clarke](https://www.piworld.com/article/target-report-half-a-loaf-is-better-than-none) | Signed March 2024, closing unconfirmed |
| HireRight | [General Atlantic and Stone Point took it private](https://www.sec.gov/Archives/edgar/data/1859285/000114036124031658/ny20031827x3_ex99-1.htm) | Complete, 28 June 2024 |
| CareerBuilder + Monster | [Court approved a three-part sale, with the job board going to BOLD](https://www.lw.com/en/news/latham-watkins-represents-careerbuilder-monster-in-court-approved-sale-transactions) | Approved, closing unconfirmed; fate of resume data not stated |
| CoreLogic | [Renamed Cotality](https://www.nationalmortgagenews.com/news/corelogic-renamed-cotality-four-years-after-going-private) | Stone Point and Insight shown as of the 2021 deal, not 2025 |
| TechTarget | [Combination with Informa's digital businesses announced complete](https://www.wilmerhale.com/en/insights/news/20241204-techtarget-completes-strategic-combination-with-informa) | 2 December 2024; stake not stated on this page |
| IDology | [Legacy brand retired, business now trades under GBG](https://www.gbgplc.com/media/bptjgjbx/gbg-fy26-results-rns-vfinal_website_02-06_26.pdf) | FY26 results, keyword review only; Acuant not named |
| Kochava | [Subsidiary CDS has taken over the broker business](https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-ban-kochava-subsidiary-selling-sensitive-location-data-settle-charges-they-sold-location-data) | Order proposed, check the docket |

**Evidence that does not settle ownership**

- **Cision.** The [2025 financing report](https://news.bloomberglaw.com/bankruptcy-law/cision-affiliate-gets-250m-financing-extends-debt-maturities) flags possible lender influence but does not address ownership.
- **Altrata and Wealth-X.** [Delinian's site](https://www.delinian.com/) supports the Delinian-to-Epiris step but never mentions Altrata or Wealth-X, and its footer reads 2023.
- **Acuant.** The [completion report](https://www.privateequitywire.co.uk/audax-private-equity-completes-sale-acuant-gb-group/) is from 2021 and shows nothing later.
- **Clarity and Disqus.** [Clarity](https://www.autoremarketing.com/financial-services/experian-acquires-clarity-services-launches-alternative-data-driven-solution) and [Disqus](https://techcrunch.com/2017/12/05/zeta-global-acquires-commenting-service-disqus/) rest only on original deal coverage, which does not prove continued ownership.

**Contested or reported links, to store as such**

- **Radaris.** [Krebs maps a network run through Bitseller Expert](https://krebsonsecurity.com/2024/03/a-close-up-look-at-the-consumer-data-broker-radaris/), but [an attorney disputes who owns it](https://krebsonsecurity.com/2024/06/krebsonsecurity-threatened-with-defamation-lawsuit-over-fake-radaris-ceo/). A [default judgment moved 14 domains to Atlas Data Privacy Corp.](https://krebsonsecurity.com/2026/09/data-broker-radaris-loses-domains-in-privacy-fight/), and the defendants are contesting it. Keep to company-level facts.
- **Eskimi and Datastream.** A letter [names Eskimi as the upstream source, and Eskimi denies it](https://www.404media.co/eskimi-2/).
- **OneRep and Nuwber.** The founder [acknowledged a stake in Nuwber but denied information-sharing](https://krebsonsecurity.com/2024/03/ceo-of-data-privacy-company-onerep-com-founded-dozens-of-people-search-firms/). OneRep [appears to be partnered with Radaris](https://krebsonsecurity.com/2025/02/nearly-a-year-later-mozilla-is-still-promoting-onerep/), based on reader accounts.

**Corporate links with direct support**

- [Unacast is the parent of Gravy Analytics](https://techcrunch.com/2025/01/13/gravy-analytics-data-broker-breach-trove-of-location-data-threatens-privacy-millions/).
- [Gravy is the parent of Venntel](https://www.404media.co/hackers-claim-massive-breach-of-location-data-giant-threaten-to-leak-data/).
- [Allstate owns Arity](https://therecord.media/texas-sues-allstate-data-privacy-cars).

## Data types and harms

- **Sensitive inferences.** The FTC alleged [Gravy and Venntel sold traits covering health decisions, politics and religion](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-takes-action-against-gravy-analytics-venntel-unlawfully-selling-location-data-tracking-consumers). California cited [lists covering Alzheimer's disease, drug addiction and incontinence](https://cppa.ca.gov/announcements/2026/20260108.html).
- **Health data on sale.** Duke found [11 of 37 brokers contacted willing and able to sell mental health data](https://techpolicy.sanford.duke.edu/wp-content/uploads/2023/02/Kim-2023-Data-Brokers-and-the-Sale-of-Americans-Mental-Health-Data.pdf). These were quotes rather than verified deliveries, and the report is adapted from an undergraduate thesis. [Chong](https://doi.org/10.25172/smustlr.26.1.6) covers reproductive health data, and a [senator's letter alleges](https://www.theregister.com/2024/02/15/data_broker_location_abortion/) Near Intelligence data enabled ads aimed at visitors to nearly 600 Planned Parenthood sites.
- **Security and military exposure.** Duke researchers [bought identified military records for $0.12 to $0.32 each](https://techpolicy.sanford.duke.edu/wp-content/uploads/2023/11/Sherman-et-al-2023-Data-Brokers-and-the-Sale-of-Data-on-US-Military-Personnel.pdf), with inconsistent buyer vetting. A [free sales sample of about 3.6 billion location points](https://netzpolitik.org/2024/databroker-files-wie-datenhaendler-nato-und-us-militaer-blossstellen/) exposed movements at US and NATO sites in Germany.
- **Physical safety.** [Brokering Safety](https://repository.law.miami.edu/fac_articles/1345) centres on abuse survivors. An FBI affidavit reportedly records [a list of 11 brokers in a suspect's vehicle](https://therecord.media/alleged-killer-minnesota-lawmaker-data-brokers-list). Word this as alleged, and do not infer which sites were involved.
- **Government buyers.** [Federal agencies buy data in ways that sidestep Fourth Amendment and statutory process](https://doi.org/10.31219/osf.io/p3aqk), according to a study of about 150 contract documents (abstract record). [70 lawmakers asked for an inspector general review](https://www.theregister.com/2026/03/03/us_lawmakers_ice_data_purchases/) of ICE's location purchases. [Biometric Update](https://www.biometricupdate.com/202603/dhs-quietly-built-pathway-to-track-americans-through-advertising-data-economy) points to primary documents worth citing directly.
- **Breaches.** National Public Data's widely repeated 2.9 billion figure [counted rows rather than people](https://krebsonsecurity.com/2024/08/nationalpublicdata-com-hack-exposes-a-nations-data/); Atlas Data Privacy counted about 272 million unique SSNs. Leaked code [showed queries to both National Public Data and USInfoSearch](https://krebsonsecurity.com/2024/08/national-public-data-published-its-own-passwords/).
- **Accuracy is uneven.**
  - At least [40% of broker-sourced attributes were rated not at all accurate](https://www.lix.polytechnique.fr/~goga/papers/databrokers-measurement_finalCameraReady.pdf) by 183 volunteers in a 2019 study.
  - [Better-off consumers are profiled more often and more accurately](https://doi.org/10.1287/mnsc.2023.4979) (abstract record).
  - [Identifying a single attribute improved by 0% to 77%](https://dblp.uni-trier.de/db/journals/mktsci/mktsci38.html#NeumannTW19) over random selection (abstract record). This link is unverified, so replace it with the publisher's page.
- **Public attitudes and price.** In a [survey of 1,405 Americans](https://arxiv.org/abs/2502.05686), trajectory features raised the most concern. [Marketplace median prices](https://arxiv.org/abs/2111.04427) are about $1,400 a month for live data, but that study is not limited to personal data.

## Opt-out effectiveness

- **Rights processes fail often.** Over [40% of 543 registered brokers never answered access requests](https://doi.org/10.1109/sp63933.2026.00104), and some of those that replied asked for details they had not previously held (abstract record). A [synthetic-identity study](https://arxiv.org/abs/2607.04552) found most brokers appeared compliant with opt-outs and deletion, though a significant minority did not. Both come from one research programme, so do not count them as independent replications. The [related dissertation](https://escholarship.org/uc/item/04c1c9rd) reports over one-fifth demanding verification for opt-outs.
- **Design obstacles.** EPIC audited [38 companies, including 15 brokers, and identified at least eight manipulative patterns](https://epic.org/wp-content/uploads/2026/05/Good-Luck-Opting-Out-Manipulative-Design-Patterns-in-Opt-Out-Processes.pdf). Disclosure: that report also reviews Anthropic, which makes the model used to check it.
- **Hidden pages.** The Markup found [35 of 499 California-registered brokers keeping opt-out pages out of search results](https://themarkup.org/privacy/2025/08/12/we-caught-companies-making-it-harder-to-delete-your-data), which prompted [a senator's letters to five firms](https://themarkup.org/privacy/2025/08/18/data-brokers-face-new-pressure-for-hiding-opt-out-pages-from-google). The atlas could reuse this check monthly.
- **Paid services.** Besides Consumer Reports, a [PETS 2025 study](https://arxiv.org/abs/2505.06989) found services failed to remove most records they identified, and participants judged only about 41% of those records to be about themselves. [Consumer Reports' per-service results ran from 4% to 68%](https://innovation.consumerreports.org/Data-Defense_-Evaluating-People-Search-Site-Removal-Services-.pdf), though one sentence in the report says 6%. Its sample is small and its test data dates from 2023.
- **Conflicts of interest.** [Mozilla still sold OneRep's service](https://krebsonsecurity.com/2025/02/nearly-a-year-later-mozilla-is-still-promoting-onerep/) as of February 2025. Recheck this before relying on it.
- **Ad-tech opt-outs.** [Data was often still collected and shared after opting out](https://doi.org/10.56553/popets-2024-0016) across four consent platforms and an advertiser opt-out.
- **Human cost.** People in an [18-person qualitative study](https://petsymposium.org/popets/2022/popets-2022-0067.php) found removal costly and hard to verify. Their belief that profits discourage removal is a perception, not a finding.
- **Central deletion.** California reports [over 500,000 DROP sign-ups and 654 brokers](https://privacy.ca.gov/2026/08/half-a-million-californians-have-signed-up-for-drop-to-delete-their-personal-information-from-data-brokers/), with about 25% of brokers reporting processing since 1 August 2026. These figures are self-reported. [AdExchanger's critic](https://www.adexchanger.com/data-privacy/the-delete-act-a-fantastically-flawed-attempt-at-solving-a-critical-problem/) offers failure modes to test, but runs a privacy company, so treat them as hypotheses. [Brokering Safety](https://repository.law.miami.edu/fac_articles/1345) offers a model for judging centralised removal.
- **Audit automation.** An [LLM agent tested on 456 broker sites](https://arxiv.org/abs/2603.03881) shows both what automation can do and where it is unreliable.

## Regulation and enforcement

- **Federal.** GAO said in 2019 that [no overarching federal law governs private-sector collection and sale of personal data](https://www.gao.gov/products/gao-19-621t). The CFPB said rulemaking was ["not necessary or appropriate at this time"](https://www.federalregister.gov/documents/2025/05/15/2025-08644/protecting-americans-from-harmful-data-broker-practices-regulation-v-withdrawal-of-proposed-rule). The FTC [sent 13 brokers warning letters under PADFAA](https://www.ftc.gov/news-events/news/press-releases/2026/02/ftc-reminds-data-brokers-their-obligations-comply-padfaa), which are not findings of violation but give a list to compare with the atlas roster.
- **FTC location cases.** The sequence runs from [X-Mode/Outlogic](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-prohibits-data-broker-x-mode-social-outlogic-selling-sensitive-location-data), through [Gravy/Venntel](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-takes-action-against-gravy-analytics-venntel-unlawfully-selling-location-data-tracking-consumers) and [Mobilewalla](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-takes-action-against-mobilewalla-collecting-selling-sensitive-location-data), to [Kochava](https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-ban-kochava-subsidiary-selling-sensitive-location-data-settle-charges-they-sold-location-data). The Gravy order has an exception for limited national security and law enforcement uses, and the Kochava order is proposed rather than final.
- **California.**
  - [SB 923](https://privacy.ca.gov/2026/09/california-expands-privacy-protections-by-strengthening-deletion-rights/), effective 1 January 2027, extends deletion to data obtained from third parties and permits suppression lists. The agency sponsored the bill, so check the enacted text.
  - [LocateSmarter](https://privacy.ca.gov/2026/08/calprivacy-brings-first-action-against-a-data-broker-under-both-the-ccpa-and-delete-act/) agreed to a $116,490 payment, partly over allegedly demanding SSN digits before an opt-out.
  - [Datamasters and S&P Global](https://cppa.ca.gov/announcements/2026/20260108.html) were fined for failing to register.
- **Other states.** [Texas alleges Allstate and Arity](https://therecord.media/texas-sues-allstate-data-privacy-cars) gathered data on over 45 million Americans without registering as a data broker. Allstate says consumers consent. Current status is not established.
- **Does enforcement work?** One non-peer-reviewed observational preprint found [New Jersey officers who sent requests appeared on 12.5 sites on average, against 62.7 for matched comparison officers](https://doi.org/10.31219/osf.io/tp7fr_v1) (abstract record). That is suggestive, not proof.
- **Registries as a source.** PRC and EFF built [750 broker groups from five registries, with 291 to 524 companies missing per state](https://privacyrights.org/resources-tools/reports/why-are-hundreds-data-brokers-not-registering-states). They caution that definitional differences mean gaps do not prove illegality. California brokers are counted as [499](https://themarkup.org/privacy/2025/08/12/we-caught-companies-making-it-harder-to-delete-your-data), [522](https://doi.org/10.1145/3805689.3812413), [543](https://doi.org/10.1109/sp63933.2026.00104) and, in DROP, [654](https://privacy.ca.gov/2026/08/half-a-million-californians-have-signed-up-for-drop-to-delete-their-personal-information-from-data-brokers/), so give any count a date.
- **Older legal scholarship, unread.** [Tsesis](https://lawecommons.luc.edu/facpubs/494), [Wayne](https://scholarlycommons.law.northwestern.edu/jclc/vol102/iss1/8) and [DiPersio](https://doi.org/10.63317/5i7sofjgfvgt) were confirmed only as far as their titles. Read them before citing their arguments.

## Duplicates in the source list

These are kept as separate CSV rows. Cite the first of each pair.

- CFPB withdrawal: [Federal Register](https://www.federalregister.gov/documents/2025/05/15/2025-08644/protecting-americans-from-harmful-data-broker-practices-regulation-v-withdrawal-of-proposed-rule), [mirror](https://open-gov.usebase.io/federal-register/2025-08644).
- Consumer Reports: [wp-content copy](https://innovation.consumerreports.org/wp-content/uploads/2024/08/Data-Defense_-Evaluating-People-Search-Site-Removal-Services-.pdf), [second copy](https://innovation.consumerreports.org/Data-Defense_-Evaluating-People-Search-Site-Removal-Services-.pdf).
- Duke mental health: [PDF](https://techpolicy.sanford.duke.edu/wp-content/uploads/2023/02/Kim-2023-Data-Brokers-and-the-Sale-of-Americans-Mental-Health-Data.pdf), [web page](https://techpolicy.sanford.duke.edu/data-brokers-and-the-sale-of-americans-mental-health-data/).
- Clearlake and D&B: [SEC filing](https://www.sec.gov/Archives/edgar/data/1799208/000110465925082892/tm2524330d1_ex99-1.htm), [Clearlake release](https://clearlake.com/news/clearlake-completes-acquisition-of-dun-bradstreet/).

## Ownership findings that conflict with the atlas

Compared with `data/ownership/ownership.json` as it stood on 31 October 2026. No atlas data was changed.

**Direct conflict**

- **Dun & Bradstreet.** The atlas names Dun & Bradstreet as its own top owner, on evidence dated 15 November 2021. [Clearlake has owned it since 26 August 2025](https://www.sec.gov/Archives/edgar/data/1799208/000110465925082892/tm2524330d1_ex99-1.htm).
- **NetWise Data.** The atlas gives Dun & Bradstreet as top owner, on the same evidence. Clearlake follows only if NetWise is still a D&B subsidiary, and [the release does not mention NetWise](https://clearlake.com/news/clearlake-completes-acquisition-of-dun-bradstreet/).

**Atlas stops short, or its evidence is weakened**

- **Institutional Shareholder Services.** The atlas stops at ISS STOXX GmbH. [Deutsche Börse was buying the last 20%](https://www.deutsche-boerse.com/dbg-en/media/news-stories/press-releases/Deutsche-B-rse-Group-to-Acquire-General-Atlantic-s-Minority-Stake-in-ISS-STOXX-4948682), so it should be the top owner once the exit is confirmed.
- **Wealth-X.** The atlas names Delinian as owner, and also applies it to other Altrata-linked brokers such as Boardex and WealthEngine. [Delinian's site does not mention Altrata or Wealth-X](https://www.delinian.com/). This does not disprove the link, so keep the review flag.
- **IDology.** GB Group as owner still holds, but the [brand has been retired](https://www.gbgplc.com/media/bptjgjbx/gbg-fy26-results-rns-vfinal_website_02-06_26.pdf), so the atlas should record it as a former name.
- **Cision.** The atlas lists Cision as its own owner, while its research notes name Platinum Equity with low confidence. The [2025 financing report](https://news.bloomberglaw.com/bankruptcy-law/cision-affiliate-gets-250m-financing-extends-debt-maturities) does not resolve this.

**Atlas has no owner, and a source offers one**

- **HireRight:** [General Atlantic and Stone Point](https://www.sec.gov/Archives/edgar/data/1859285/000114036124031658/ny20031827x3_ex99-1.htm).
- **R.R. Donnelley, with its merged Valassis names:** [Chatham](https://www.lowenstein.com/news-insights/firm-news/lowenstein-represents-chatham-asset-management-sole-owner-of-rr-donnelley-sons-in-purchase-of-digital-print-and-marketing-businesses-from-vericast). The Valassis link rests on [Piworld](https://www.piworld.com/article/target-report-half-a-loaf-is-better-than-none).
- **Gravy Analytics:** [Unacast](https://techcrunch.com/2025/01/13/gravy-analytics-data-broker-breach-trove-of-location-data-threatens-privacy-millions/).
- **Venntel:** [Gravy Analytics](https://www.404media.co/hackers-claim-massive-breach-of-location-data-giant-threaten-to-leak-data/).
- **Airlines Reporting:** [airline-owned, including Delta, American and United](https://www.404media.co/airlines-dont-want-you-to-know-they-sold-your-flight-data-to-dhs/).
- **CareerBuilder:** [BOLD as a candidate](https://www.lw.com/en/news/latham-watkins-represents-careerbuilder-monster-in-court-approved-sale-transactions) for the job board. Closing is unconfirmed, and this should not be applied to the atlas's separate CareerBuilder Employment Screening entry, which the sources here do not cover.

**Checked, no conflict**

- Infutor to [ActiveProspect](https://stocks.observer-reporter.com/observerreporter/article/gnwcq-2026-1-8-verisk-announces-sale-of-its-marketing-solutions-business-to-activeprospect).
- Corelogic Credco to [Cotality](https://www.nationalmortgagenews.com/news/corelogic-renamed-cotality-four-years-after-going-private).
- TechTarget to [Informa](https://www.wilmerhale.com/en/insights/news/20241204-techtarget-completes-strategic-combination-with-informa).
- Arity to [Allstate](https://therecord.media/texas-sues-allstate-data-privacy-cars).
- Acuant to [GB Group](https://www.privateequitywire.co.uk/audax-private-equity-completes-sale-acuant-gb-group/).
- Clarity to [Experian](https://www.autoremarketing.com/financial-services/experian-acquires-clarity-services-launches-alternative-data-driven-solution).
- Disqus to [Zeta Global](https://techcrunch.com/2017/12/05/zeta-global-acquires-commenting-service-disqus/).

The last three rest on old evidence, so "no conflict" does not mean current ownership is confirmed.

## Unreachable items: unverified and not relied on

None of these could be read, and nothing above depends on them.

- **Unverified.** [You Have the Right to be Deleted: First Amendment Challenges to Data Broker Deletion Laws](https://doi.org/10.2139/ssrn.5009948), Molly Cinnamon, SSRN, 2024.
- **Unverified.** [Laundering Data: How the Government's Purchase of Commercial Location Data Violates Carpenter and Evades the Fourth Amendment](https://doi.org/10.2139/ssrn.3895964), Dori Rahbar, SSRN, 2021.
- **Unverified.** [Reining in Commercial Exploitation of Consumer Data](https://doi.org/10.2139/ssrn.5039968), Max Helveston, SSRN, 2025.
- **Unverified.** [A Review of the Data Broker Industry: Collection, Use, and Sale of Consumer Data for Marketing Purposes](https://www.commerce.senate.gov/wp-content/uploads/media/doc/12.18.13%20Senate%20Commerce%20Committee%20Report%20on%20Data%20Broker%20Industry.pdf), US Senate Commerce Committee majority staff, 18 December 2013.
- **Unverified.** [Anyone Can Buy Data Tracking US Soldiers and Spies to Nuclear Vaults and Brothels in Germany](https://www.wired.com/story/phone-data-us-soldiers-spies-nuclear-germany/), WIRED, November 2024. The vendor's identity is unconfirmed.
- **Unverified.** [RRD to be acquired by Chatham; terminates Atlas deal](https://printweek.com/articles/rrd-to-be-acquired-by-chatham-terminates-atlas-deal), PrintWeek, December 2021. Approval and closing are not confirmed.
- **Unverified.** [UCLA Law's Information Policy Lab Comment Before the California Privacy Protection Agency Concerning the Accessible Deletion Mechanism (DROP System) Proposed Regulations](https://doi.org/10.2139/ssrn.5288652), Melodi Dinçer, SSRN, 2025.
- **Unverified.** [Where the Fourth Amendment Fails: Using the European Court of Human Rights Framework to Limit Law Enforcement Agencies' Purchases of People's Data from Data Brokers](https://doi.org/10.5195/lawreview.2023.968), Zev T. Chabus, University of Pittsburgh Law Review, 8 August 2023.
- **Unverified.** [CareerBuilder + Monster completes Chapter 11 sales](https://www.staffingindustry.com/news/global-daily-news/careerbuilder-monster-completes-chapter-11-sales), Staffing Industry Analysts, 2025. The closing date and price are from search summaries only.
