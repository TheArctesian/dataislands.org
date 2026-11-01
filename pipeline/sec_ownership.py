#!/usr/bin/env python3
"""Link brokers to public parents through SEC annual filings.

A broker links to a parent when its legal name is the filer, or appears in the
subsidiary exhibit of the filer's latest annual report. Downloads are cached in
data/raw/edgar, so a rerun only asks SEC for what is missing.
"""
import csv
import html
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

from census import ROOT, normalized_name

CACHE = ROOT / "data" / "raw" / "edgar"
BROKERS = ROOT / "data" / "census" / "brokers.json"
OUT = ROOT / "data" / "ownership" / "sec-links.csv"
USER_AGENT = f"dataislands.org public broker atlas {os.environ.get('SEC_CONTACT', '')}".strip()
ANNUAL_FORMS = ("10-K", "20-F", "40-F")
REQUEST_GAP_SECONDS = 0.2

# Public companies known to own brokers under a different name, so name matching alone misses them.
PARENT_TICKERS = [
    "ACN", "ALL", "APP", "BLKB", "CARS", "CDLX", "CLVT", "CMCSA", "CRTO", "CSGP", "DH", "DLX", "DSP", "EFX", "FICO",
    "FLNT", "FORA", "GM", "GTM", "HUBS", "IBTA", "INTU", "IQV", "LDOS", "MAR", "MCO", "MGNI", "MSCI", "NEXN", "OMC",
    "ORCL", "PRCH", "PUBM", "QUAD", "RAMP", "RELX", "SEMR", "SMWB", "SPGI", "SPT", "TEAD", "TRI", "TRU", "TTGT",
    "V", "VEEV", "VRSK", "WPP", "YEXT", "ZD", "ZETA", "ZM",
]


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept-Encoding": "identity"})
    time.sleep(REQUEST_GAP_SECONDS)
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def cached(name, url):
    path = CACHE / name
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(fetch(url))
    return path.read_bytes()


def latest_annual_filing(cik):
    data = json.loads(cached(f"submissions/{cik:010d}.json", f"https://data.sec.gov/submissions/CIK{cik:010d}.json"))
    recent = data["filings"]["recent"]
    for index, form in enumerate(recent["form"]):
        if form in ANNUAL_FORMS:
            return recent["accessionNumber"][index], recent["filingDate"][index], form
    return None


def subsidiary_exhibit(cik, accession):
    """The document the filer itself typed as its subsidiary list: EX-21, or EX-8 on a 20-F."""
    folder = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession.replace('-', '')}"
    index = cached(f"index/{accession}-index.html", f"{folder}/{accession}-index.htm").decode("utf-8", "replace")
    documents = {}
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", index, re.S | re.I):
        link = re.search(r'href="[^"]*/([^"/]+)"', row)
        kind = re.search(r"<td[^>]*>\s*(EX-(?:21|8)[.\d]*)\s*</td>", row, re.I)
        if link and kind:
            documents[kind.group(1).upper()] = link.group(1).removeprefix("ix?doc=")
    if not documents:
        return None, None
    name = documents[min(documents, key=lambda k: not k.startswith("EX-21"))]
    url = f"{folder}/{name}"
    return cached(f"exhibits/{accession}-{name}", url), url


def visible_text(raw):
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw.decode("utf-8", "replace"), flags=re.S | re.I)
    text = re.sub(r"</(tr|p|div|li|td)>|<br[^>]*>", "\n", text, flags=re.I)
    return html.unescape(re.sub(r"<[^>]+>", " ", text))


def listed_in(alias, lines, exhibit):
    """One word must be the whole entry: "catalina" or "healthcare" inside a longer name proves nothing."""
    if len(alias.split()) == 1:
        return alias in lines
    return re.search(rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])", exhibit) is not None


def main():
    if "SEC_CONTACT" not in os.environ:
        sys.exit("set SEC_CONTACT to the email SEC should see in the User-Agent")
    brokers = json.loads(BROKERS.read_text())
    tickers = json.loads(cached("company_tickers.json", "https://www.sec.gov/files/company_tickers.json"))
    by_name = {}
    for company in tickers.values():
        by_name.setdefault(normalized_name(company["title"]), company)

    names = {normalized_name(a): b for b in brokers for a in b["aliases"]}
    by_ticker = {c["ticker"]: c for c in tickers.values()}
    filers = {normalized_name(by_ticker[t]["title"]): by_ticker[t] for t in PARENT_TICKERS if t in by_ticker}
    missing = [t for t in PARENT_TICKERS if t not in by_ticker]
    filers.update({n: by_name[n] for n in names if n in by_name})

    links, no_exhibit = [], []
    for norm, company in sorted(filers.items()):
        cik, title = company["cik_str"], company["title"]
        filing = latest_annual_filing(cik)
        if norm in names:
            links.append([names[norm]["id"], names[norm]["name"], title, company["ticker"], "name_match_unverified", "",
                          filing[1] if filing else "", f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}"])
        if not filing:
            continue
        raw, url = subsidiary_exhibit(cik, filing[0])
        if raw is None:
            no_exhibit.append(title)
            continue
        lines = [normalized_name(line) for line in visible_text(raw).splitlines() if line.strip()]
        exhibit, line_set = " | ".join(lines), set(lines)
        for alias, broker in names.items():
            if alias != norm and listed_in(alias, line_set, exhibit):
                links.append([broker["id"], broker["name"], title, company["ticker"], "listed_subsidiary",
                              alias, filing[1], url])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["broker_id", "broker", "parent", "ticker", "link", "matched_name", "filing_date", "evidence_url"])
        writer.writerows(sorted(links))
    print(f"filers checked      {len(filers)}")
    print(f"not on ticker list  {missing}")
    print(f"no exhibit found    {no_exhibit}")
    print(f"links               {len(links)} covering {len({l[0] for l in links})} brokers")


if __name__ == "__main__":
    main()
