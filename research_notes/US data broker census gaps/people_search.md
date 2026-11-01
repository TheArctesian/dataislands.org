# US people-search and public-records sites missing from the census

Checked 2026-10-30. Census: `data/census/brokers.csv` (920 rows). Domain matching was exact against the full `domains` column, after splitting on `;`. Where a sister domain of a census brand was found, it is flagged rather than counted as a new brand.

Scope notes:
- No individual's records were searched on any site. Homepages were fetched only to read footer operator statements. Terms and privacy pages were fetched where they were reachable.
- Several sites returned HTTP 403 to the fetcher, or timed out. Those are marked "not verified", not "no operator".

## Key question 1: Which sites appear in opt-out and removal-service lists?

### Takeaway
The Big Ass Data Broker Opt-Out List (last updated 2026-09-27) and DeleteMe's "sites we remove from" page together name about 45 people-search or records domains that are absent from the census by exact domain. DeleteMe's page states a headline of 969 brokers. Its full list is on the page and I fetched it. Incogni's list is also on its page, but the fetch returned only examples, so it was not compared line by line.

### Cited Findings
- Big Ass Data Broker Opt-Out List: the "People Search Sites" section and the affiliate list name about 45 sites, including PeopleByName, PrivateEye, SearchQuarry, Veripages, National Public Data, UnitedStatesPhoneBook, VoterRecords, EveryJoe and Archives.com. Last updated 2026-09-27 — [Source](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List)
- DeleteMe's "sites we remove from" page lists 969 brokers in its headline and includes the domains used below — [Source](https://joindeleteme.com/sites-we-remove-from/)
- Incogni's published broker list is a table with name, domain, data sensitivity, category and coverage. It contains People Search Site entries such as Spokeo, Whitepages and Peoplefinders. The list is Incogni's own, not an independent inventory — [Source](https://blog.incogni.com/data-brokers-incogni-covers/)
- Optery's coverage figures differ by source and date. A ToolRadar page, which says it checked Optery's plans in October 2026, gives 380+ to 625+ automated sites by tier, plus custom removals. Optery's own newer page says 405 brokers — [Source](https://toolradar.com/tools/optery) and [Source](https://www.optery.com/?p=28246) (search snippet only; not fetched)
- Incogni's own materials claim 420+ verified removals, and cite a Deloitte limited-assurance report dated 2025-07-18. The figure comes from search snippets, not a fetched page — [Source](https://blog.incogni.com/?p=15291) (search snippet only; not fetched)
- DeleteMe's automated tier is far smaller than its headline. Third-party reviews say the standard plan covers about 100 sites, with the rest handled by custom request — [Source](https://onerep.com/blog/deleteme-review) (secondary; not fetched)

### Inferences
- The opt-out lists are dominated by people-search and background-check brands that already exist in the census. The gaps are mainly small or secondary domains.
- DeleteMe's and Big Ass's lists mention sites under brand names that differ from their domains, such as UnitedStatesPhoneBook and usphonebook.com. Domain matching alone can miss these, so the table flags sister-domain cases.

### Gaps
- DeleteMe's full list was checked against the census only for the people-search and records domains listed in the table below. The other roughly 900 DeleteMe domains (for example international 411 and Yellow Pages sites) were not checked, because they are outside US scope.
- The Incogni list was not fetched in full, so it was not compared line by line with the census.
- Optery's and Incogni's counts are self-reported or secondary, and they conflict. I did not resolve the conflict.

## Key question 2: Which sites are absent from the census by domain?

### Takeaway
About 45 DeleteMe-listed domains and 9 Big Ass-listed domains are absent from the census by exact domain. Most have no operator statement I could verify. Several are sister domains of census brands, and so are probably the same brand. Ancestry.com, Classmates.com and FamilySearch are records or social sites, not people-search brokers, and are listed separately.

### Cited Findings

**Table A: missing brands with operator or Big Ass evidence**

| Site | Domain | Operating company (as stated on site) | Evidence URL | Date checked | Notes |
|---|---|---|---|---|---|
| PeopleByName | peoplebyname.com | Not verified (homepage fetch returned 403) | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | Terms and privacy URLs returned 404 (curl) |
| PrivateEye | privateeye.com | None stated. Footer reads "© 2026 PrivateEye.com" with no legal entity. Terms and privacy links are "#" | [Homepage](https://www.privateeye.com/); [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List) | 2026-10-30 | |
| SearchQuarry | searchquarry.com | "SearchQuarry is operated by Search Quarry, LLC" (footer) | [Homepage](https://www.searchquarry.com/); [Terms](https://www.searchquarry.com/terms/) (linked, not fetched in full); [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List) | 2026-10-30 | Operator statement is from the homepage footer |
| Veripages | veripages.com | Not verified (403) | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | Terms and privacy URLs returned 404 |
| National Public Data | nationalpublicdata.com | Not verified (403) | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List) | 2026-10-30 | |
| LookUpAnyone | lookupanyone.com | Not verified (timed out). Big Ass lists it as an affiliate, without naming a parent | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | |
| UnitedStatesPhoneBook | unitedstatesphonebook.com | Not verified (403) | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | Census has usphonebook.com under family-tree-now; may be the same brand, not verified |
| VoterRecords | voterrecords.com | Not verified (403) | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | |
| EveryJoe | everyjoe.com | Not confirmed. Terms and privacy pages fetched by curl, no legal entity found by pattern match | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | Needs manual read of terms |
| PropertyRecs | propertyrecs.com | Not verified | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List) | 2026-10-30 | Property data, not person search |
| Archives.com | archives.com | Not verified | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | Genealogy and records; borderline |
| TruePeopleSearch.net | truepeoplesearch.net | Not verified | [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List); [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/) | 2026-10-30 | Sister domain of census truepeoplesearch.com. Probably not a new brand |

**Table B: missing brands with DeleteMe-list evidence only**

Each row's evidence is the [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/). No operator was checked for these rows, and none was fetched. Several may be sister or parent-owned domains of census brands; ownership was not checked.

| Site | Domain | Operating company | Date checked | Notes |
|---|---|---|---|---|
| Advanced People Search | advanced-people-search.com | Not checked | 2026-10-30 | |
| America Phone Book | americaphonebook.com | Not checked | 2026-10-30 | |
| AllPeople | allpeople.com | Not checked | 2026-10-30 | |
| Background Alert | backgroundalert.com | Not checked | 2026-10-30 | |
| Background Checks .org | backgroundchecks.org | Not checked | 2026-10-30 | |
| CocoFinder | cocofinder.com | Not checked | 2026-10-30 | Terms and privacy returned 403 |
| DataVeria | dataveria.com | Not checked | 2026-10-30 | |
| FindPeopleSearch | findpeoplesearch.com | Not checked | 2026-10-30 | |
| FindPeopleFast | findpeoplefast.net | Not checked | 2026-10-30 | |
| Free Background Check .org | freebackgroundcheck.org | Not checked | 2026-10-30 | |
| Free Background Checks | freebackgroundchecks.com | Not checked | 2026-10-30 | |
| FreePeopleScan | freepeoplescan.com | Not checked | 2026-10-30 | |
| IDCrawl | idcrawl.com | Not checked | 2026-10-30 | |
| IDTrue | idtrue.com | Not checked | 2026-10-30 | |
| LocatePeople | locatepeople.org | Not checked | 2026-10-30 | |
| PeopleFinderFree | peoplefinderfree.com | Not checked | 2026-10-30 | Possibly a PeopleFinders-related brand; not verified |
| PeopleSearch | peoplesearch.com | Not checked | 2026-10-30 | |
| PeopleSearchExpert | peoplesearchexpert.com | Not checked | 2026-10-30 | |
| PeopleFindeers | peoplefindeers.com | Not checked | 2026-10-30 | Possible typo of a people-finder brand; not verified |
| PublicRecordsSearcher | publicrecordssearcher.com | Not checked | 2026-10-30 | |
| RealPeopleSearch | realpeoplesearch.com | Not checked | 2026-10-30 | |
| SearchUSAPeople | searchusapeople.com | Not checked | 2026-10-30 | |
| SearchPeopleFree.net | searchpeoplefree.net | Not checked | 2026-10-30 | Sister domain of census searchpeoplefree.com |
| SortedByName | sortedbyname.com | Not checked | 2026-10-30 | |
| SpyTox | spytox.com | Not checked | 2026-10-30 | |
| TrueSearch | truesearch.com | Not checked | 2026-10-30 | |
| USA Records | usrecords.net | Not checked | 2026-10-30 | |
| USATrace | usatrace.com | Not checked | 2026-10-30 | |
| VerifyRecords | verifyrecords.com | Not checked | 2026-10-30 | |
| ZLookup | zlookup.com | Not checked | 2026-10-30 | |
| UFind | ufind.name | Not checked | 2026-10-30 | |
| NumLooker | numlooker.com | Not checked | 2026-10-30 | Reverse-phone brand |
| PeepLookup | peeplookup.com | Not checked | 2026-10-30 | Reverse-phone brand |
| CUFinder | cufinder.io | Not checked | 2026-10-30 | Business-contact brand |
| QuickPeopleTrace | quickpeopletrace.com | Not checked | 2026-10-30 | |
| PrivateNumberChecker | privatenumberchecker.com | Not checked | 2026-10-30 | Reverse-phone brand |
| IDCaller | idcaller.com | Not checked | 2026-10-30 | Reverse-phone brand |
| OpenCallerListings | opencallerlistings.com | Not checked | 2026-10-30 | Reverse-phone brand |
| OKCaller | okcaller.com | Not checked | 2026-10-30 | Reverse-phone brand |
| ReversePhoneCheck | reversephonecheck.com | Not checked | 2026-10-30 | Reverse-phone brand |
| Telephone.city | telephone.city | Not checked | 2026-10-30 | Reverse-phone brand |
| PhoneOwner | phoneowner.us | Not checked | 2026-10-30 | Reverse-phone brand |
| RevealName | revealname.com | Not checked | 2026-10-30 | |
| RevealPhoneOwner | revealphoneowner.com | Not checked | 2026-10-30 | |
| CellRevealer | cellrevealer.com | Not checked | 2026-10-30 | Reverse-phone brand |
| CatfishNumber | catfishnumber.com | Not checked | 2026-10-30 | |
| CHKPPL | chkppl.com | Not checked | 2026-10-30 | |
| OffenderRadar | offenderradar.com | Not checked | 2026-10-30 | Offender-registry search; borderline |
| InmateAid | inmateaid.com | Not checked | 2026-10-30 | Inmate-records search; borderline |
| Neighbor.report | neighbor.report | Not checked | 2026-10-30 | |
| OurPublicRecords | ourpublicrecords.org | Not checked | 2026-10-30 | |
| CourtRec | courtrec.com | Not checked | 2026-10-30 | Court-records search |
| PublicRecords.us | publicrecords.us | Not checked | 2026-10-30 | |
| PublicData.com | publicdata.com | Not checked | 2026-10-30 | Not verified as US-only |
| Pub360 | pub360.com | Not checked | 2026-10-30 | |
| PeopleWizard | peoplewizard.net | Not checked | 2026-10-30 | |
| Yasni | yasni.com | Not checked | 2026-10-30 | Not verified as US-only |
| Presearch | presearch.com | Not checked | 2026-10-30 | Search engine; likely out of scope |

**Table C: records and social sites, not brokers (excluded from the table above)**

- Ancestry.com (ancestry.com): missing from census. It appears on the [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List) and the [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/). It is a genealogy service, so it is out of scope as a broker.
- Classmates.com (classmates.com): missing from census. It appears on the [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List). It is a social network, not a broker.
- FamilySearch (familysearch.org): missing from census. It is a genealogy service and appears on the [DeleteMe list](https://joindeleteme.com/sites-we-remove-from/). Not treated as a broker.
- PimEyes (pimeyes.com) and FaceCheck.ID (facecheck.id): facial-recognition search. Both are missing from census. Both appear on the [Big Ass list](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List). US jurisdiction was not verified.

**Not treated as gaps**

- Clustal (clustal.org), listed in the Big Ass list, is probably a typo for ClustrMaps. ClustrMaps (clustrmaps.com) is already in the census.
- UN Public Administration Network (unpan.org) and Men Stopping Violence (menstoppingviolence.org) are on the Big Ass list. They are not people-search brokers, and no operator evidence was checked.
- Social Catfish (socialcatfish.com) and PeopleConnect (peopleconnect.us) are already in the census.

### Inferences
- Table A rows are the strongest candidates, since each appears on the Big Ass list as a people-search site. Table B rows are weaker: they appear only in DeleteMe's coverage list, and that list also includes reverse-phone, business-contact and search-engine sites.
- Census coverage of people-search brands is already strong. The 45 DeleteMe-only domains are mostly small, sister or reverse-phone sites.

### Gaps
- Operators for most rows are unverified. The 403 responses and timeouts meant the fetcher could not read the terms or privacy pages, and I did not retry with other methods.
- Ownership of sister domains (for example PeopleFinderFree, TruePeopleSearch.net, SearchPeopleFree.net, UnitedStatesPhoneBook) was not checked against the census parent.
- No US-only check was run on the non-US-looking domains (PublicData.com, Yasni, PimEyes, FaceCheck.ID).

## Key question 3: Is an operating company named on each site's own terms or privacy page?

### Takeaway
Only SearchQuarry has an operator named on the site: "SearchQuarry is operated by Search Quarry, LLC", from its homepage footer. PrivateEye names no legal entity, and its terms and privacy links are placeholders. The other sites either returned 403 to the fetcher or 404s, or their terms could not be read in full.

### Cited Findings
- SearchQuarry footer: "SearchQuarry is operated by Search Quarry, LLC." Terms page: https://www.searchquarry.com/terms/ (linked; contents not retrieved in full) — [Source](https://www.searchquarry.com/)
- PrivateEye: footer "© 2026 PrivateEye.com"; no legal entity; terms and privacy links are "#" — [Source](https://www.privateeye.com/)
- PeopleByName, Veripages, National Public Data, UnitedStatesPhoneBook, VoterRecords and CocoFinder returned HTTP 403, and PeopleByName and Veripages also returned 404 on their terms or privacy paths — no operator recorded.
- LookUpAnyone: connection timed out — no operator recorded.

### Inferences
- The operator field in Table A is mostly blank because of access failures, not because the site names no operator. Re-checking these from a browser session may fill them in.

### Gaps
- Terms and privacy pages for about 10 sites were not readable from this environment.
- The SearchQuarry terms text was not read in full, so the operator statement rests on the homepage footer.
