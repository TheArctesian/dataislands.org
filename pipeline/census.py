#!/usr/bin/env python3
"""Merge every broker source in data/raw into one list, data/census/.

Standard library only. Reruns are deterministic: nothing here reads the clock
or the network, so a diff in the output means a source changed.
"""
import collections
import csv
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "census"

CPPA_FILE = RAW / "cppa" / "registry-2026-10-30.csv"
CPPA_AS_OF = "2026-10-30"
PRC_FILE = RAW / "prc" / "Data_Broker_Full_Registry_2025.xlsx"
PRC_AS_OF = "2025-04"
TEXAS_FILE = RAW / "texas" / "registry-2026-10-30.tsv"
TEXAS_AS_OF = "2026-10-30"

# A shared domain only proves common ownership if the domain belongs to the broker.
SHARED_HOSTS = {
    "linkedin.com", "facebook.com", "twitter.com", "x.com", "instagram.com", "google.com",
    "gmail.com", "outlook.com", "yahoo.com", "termly.io", "onetrust.com", "trustarc.com",
    "wixsite.com", "wordpress.com", "squarespace.com", "godaddysites.com", "github.io",
    "github.com", "medium.com", "zendesk.com", "sites.google.com", "ca.gov", "vermont.gov", "texas.gov",
}
TWO_LABEL_SUFFIXES = {"co.uk", "org.uk", "com.au", "co.nz", "co.jp", "com.br", "co.in", "com.sg"}
LEGAL_SUFFIXES = re.compile(
    r"\b(llc|l l c|inc|incorporated|corp|corporation|co|company|ltd|limited|lp|llp|plc|"
    r"holdings|group|dba|the|and its subsidiaries and affiliates|and affiliates|and subsidiaries)\b"
)
# Registrants filed under a person's name. Never a display name or alias while a
# business name exists; held back from publication if no business name is known.
PERSON_NAMES = {"charles bennett", "david rickenbacher", "dustin blackman", "stefan certic", "steven jacoby"}
# Records a person-checked review found wrongly joined, each with its evidence in
# data/ownership/review/merge-results.csv. Each group merges only within itself.
SPLITS = {
    "M07": {"names": {"careerbuilder employment screening"}, "domains": set()},
    "M08": {"names": {"teletrack"}, "domains": {"teletrack.com"}},
    "M17": {"names": {"family tree now"}, "domains": {"familytreenow.com"}},
    "M22": {"names": {"insurance services office", "iso services", "iso claims services", "data driven safety",
                      "quality planning"}, "domains": {"iso.com", "verisk.com"}},
}
# A registry row whose legal name field carries the trading name, so it misses the plain name key.
SAME_LEGAL_NAME = {"lead intelligence d b a infutordata": "lead intelligence"}
# Registry rows that declare a website belonging to a former or unrelated owner.
WRONG_DOMAINS = {
    "teletrack": ("M08", {"corelogic.com"}),
    "valassis communications": ("M27", {"vericast.com"}),
    "valassis direct mail": ("M27", {"vericast.com"}),
    "lead intelligence": ("M22", {"iso.com", "verisk.com"}),
    "lead intelligence d b a infutordata": ("M22", {"iso.com", "verisk.com"}),
}
MIN_LEGAL_NAME_KEY = 3
MIN_BRAND_NAME_KEY = 5
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")

# Column positions in the CPPA registry CSV.
CPPA_SENSITIVE = {
    "minors": 11, "account_logins": 12, "government_id": 13, "citizenship": 14, "union": 15,
    "sexual_orientation": 16, "gender_identity": 17, "biometric": 18, "precise_geolocation": 19,
    "reproductive_health": 20,
}
CPPA_BUYERS = {"foreign_actor": 21, "federal_government": 22, "state_government": 23,
               "law_enforcement": 24, "genai_developer": 25}
CPPA_REGIMES = {"FCRA": 26, "GLBA": 30, "IIPPA": 34, "CMIA": 38, "HIPAA": 42}
CPPA_DELETE = {"total": 46, "complied_whole": 47, "complied_part": 48, "denied": 49}

PRC_COLLECTS = {
    "CollectsNames": "names", "CollectsAddresses": "addresses", "CollectsDOB": "date_of_birth",
    "CollectsPOB": "place_of_birth", "CollectsMMN": "mothers_maiden_name",
    "CollectsBiometricData": "biometric", "CollectsSSNGovID": "government_id",
    "CollectsOtherInfo": "other", "CollectsMinorsData": "minors",
    "CollectsReproductiveHealthData": "reproductive_health", "CollectsEmploymentData": "employment",
    "CollectsNetworkData": "network", "CollectsCommercialData": "commercial",
}


def registrable_domain(value):
    value = (value or "").strip().lower()
    if not value or "@" in value:
        return None
    host = urlparse(value if "://" in value else f"https://{value}").hostname
    if not host or "." not in host:
        return None
    labels = host.removeprefix("www.").split(".")
    if len(labels) < 2 or labels[-1] == "none":
        return None
    keep = 3 if ".".join(labels[-2:]) in TWO_LABEL_SUFFIXES else 2
    domain = ".".join(labels[-keep:])
    return None if domain in SHARED_HOSTS else domain


def split_urls(value):
    return [u for u in re.split(r"[;,\s]+", value or "") if u]


def normalized_name(name):
    text = re.sub(r"[^a-z0-9]+", " ", (name or "").lower().replace("&", " and "))
    return " ".join(LEGAL_SUFFIXES.sub(" ", text).split())


def yes(value):
    return (value or "").strip().lower() == "yes"


def number(value):
    digits = re.sub(r"[^0-9.]", "", value or "")
    try:
        return float(digits) if digits else None
    except ValueError:
        return None


def record(source, as_of, name, **fields):
    base = {"source": source, "as_of": as_of, "name": (name or "").strip(), "dba": "", "website": "",
            "privacy_url": "", "opt_out_url": "", "email": "", "state": "", "country": "",
            "group": None, "registry": None, "cppa": None, "collects": {}, "category_hint": None,
            "us_target": False}
    base.update(fields)
    return base


def read_cppa():
    with CPPA_FILE.open(encoding="utf-8-sig", errors="replace", newline="") as handle:
        rows = list(csv.reader(handle))[1:]
    for row in rows:
        row += [""] * (77 - len(row))
        delete = {key: number(row[col]) for key, col in CPPA_DELETE.items()}
        yield record(
            "cppa", CPPA_AS_OF, row[0], dba=row[1].strip(), website=row[2].strip(),
            email=row[3].strip(), state=row[7].strip().upper(), country=row[9].strip(),
            privacy_url=row[10].strip(), registry="California (CPPA)", us_target=True,
            cppa={
                "sensitive": [k for k, c in CPPA_SENSITIVE.items() if yes(row[c])],
                "sold_to": [k for k, c in CPPA_BUYERS.items() if yes(row[c])],
                "regimes": [k for k, c in CPPA_REGIMES.items() if yes(row[c])],
                "delete_requests": delete,
                "comment": row[76].strip(),
            },
        )


def read_prc():
    namespace = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    with zipfile.ZipFile(PRC_FILE) as archive:
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    rows = []
    for row in sheet.find(f"{namespace}sheetData"):
        cells = {}
        for cell in row:
            column = re.match(r"[A-Z]+", cell.get("r")).group()
            value = cell.find(f"{namespace}v")
            cells[column] = "".join(t.text or "" for t in cell.iter(f"{namespace}t")) or (
                value.text if value is not None else "")
        rows.append(cells)
    header = rows[0]
    for cells in rows[1:]:
        row = {header[k]: cells.get(k, "") for k in header}
        # Tri-state in the source: 1 says yes, 0 says no, 2 or blank says nothing.
        collects = {label: {"1": True, "0": False}[row[col]]
                    for col, label in PRC_COLLECTS.items() if row.get(col) in ("1", "0")}
        yield record(
            "prc", PRC_AS_OF, row["Name"], website=row["WebsiteURL"].strip(),
            privacy_url=row["PrivacyPolicyURL"].strip(), opt_out_url=row["OptOutURL"].strip(),
            email=row["Email"].strip(), state=row["State"].strip().upper(),
            country=row["Country"].strip(), group=row["GroupUUID_Combined"],
            registry=row["RegistrySource"], collects=collects, us_target=True,
        )


def read_incogwe():
    for filename in ("brokers.json", "curated.json"):
        for broker in json.loads((RAW / "incogwe" / filename).read_text()):
            established = broker.get("establishedIn", "")
            contact = broker["legalContact"]
            yield record(
                "incogwe", broker["provenance"].rsplit(":", 1)[-1], broker["name"],
                website=(broker["domains"] or [""])[0], email=contact.get("email") or "",
                privacy_url=contact.get("privacyPortal") or "",
                country="United States" if established.startswith("US") else established,
                state=established.removeprefix("US-") if established.startswith("US-") else "",
                category_hint=None if filename == "brokers.json" else broker["category"],
                us_target=established.startswith("US"),
            )


def read_texas():
    with TEXAS_FILE.open(newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            website = row["website"]
            # Only a separator means several sites; a stray space is a typo in the filing.
            if not re.search(r"[;,]", website):
                website = website.replace(" ", "")
            yield record("texas", TEXAS_AS_OF, row["legal_name"], website=website,
                         registry="Texas (live)", us_target=True)


def yaml_scalar(text, key):
    match = re.search(rf"^{key}:\s*\"?([^\"\n]+?)\"?\s*$", text, re.M)
    return match.group(1) if match else ""


def read_deletewe():
    for path in sorted((RAW / "deletewe").glob("*.yaml")):
        text = path.read_text()
        # DROP is California's deletion channel, modelled as a catalogue entry there.
        if yaml_scalar(text, "id") == "california-drop":
            continue
        block = re.search(r"^jurisdictions:\n((?:\s+- .+\n)+)", text, re.M)
        jurisdictions = re.findall(r"- (\S+)", block.group(1)) if block else []
        yield record(
            "deletewe", "2419caf", yaml_scalar(text, "name"), website=yaml_scalar(text, "homepage"),
            category_hint=yaml_scalar(text, "category"),
            us_target=any(j.startswith("US") for j in jurisdictions),
        )


class Clusters:
    def __init__(self, size):
        self.parent = list(range(size))

    def find(self, item):
        while self.parent[item] != item:
            self.parent[item] = self.parent[self.parent[item]]
            item = self.parent[item]
        return item

    def join(self, left, right):
        self.parent[self.find(left)] = self.find(right)


def cluster(records):
    """Join records that declare the same website, name or trading name.

    PRC groups are not a join key: they place CoreLogic registrations in the Equifax
    group, so they are reported as parent candidates for a person to confirm.
    """
    clusters = Clusters(len(records))
    first = {}
    for index, rec in enumerate(records):
        for key in rec["keys"]:
            clusters.join(index, first.setdefault(key, index))
    groups = collections.defaultdict(list)
    for index, rec in enumerate(records):
        groups[clusters.find(index)].append(rec)
    return list(groups.values())


def display_name(members):
    """Prefer the spelling matching the commonest domain, then the current registry, then mixed case."""
    counts = collections.Counter(m["name"] for m in members if m["name"])
    domains = collections.Counter(d for m in members for d in m["domains"])
    root = domains.most_common(1)[0][0].split(".")[0] if domains else ""
    def rank(name):
        current = any(m["name"] == name and m["source"] == "cppa" for m in members)
        matches_domain = bool(root) and root in normalized_name(name).replace(" ", "")
        is_person = normalized_name(name) in PERSON_NAMES
        return (not is_person, matches_domain, current, not name.isupper(), counts[name], -len(name), name)
    return max(counts, key=rank)


def sum_delete(rows):
    total = collections.Counter()
    seen = set()
    for row in rows:
        for key, value in row["delete_requests"].items():
            if value is not None:
                total[key] += value
                seen.add(key)
    return {key: int(total[key]) for key in sorted(seen)}


def traced(members, values_of):
    """Each value with the sources that declared it."""
    seen = collections.defaultdict(set)
    for member in members:
        for value in values_of(member):
            if value:
                seen[value].add(member["source"])
    return {value: sorted(sources) for value, sources in sorted(seen.items())}


def build_broker(members):
    sorted_unique = lambda values: sorted({v for v in values if v})
    cppa = [m["cppa"] for m in members if m["cppa"]]
    collects = {}
    for member in members:
        for label, value in member["collects"].items():
            collects[label] = collects.get(label, False) or value
    registries = sorted({(m["registry"], m["as_of"]) for m in members if m["registry"]})
    countries = sorted_unique(m["country"] for m in members)
    in_us = bool(registries) or any(m["us_target"] for m in members)
    name = display_name(members)
    is_shown = lambda m: normalized_name(m["name"]) not in PERSON_NAMES or m["name"] == name
    return {
        "name": name,
        "hold_back": normalized_name(name) in PERSON_NAMES,
        "aliases": sorted_unique(m["name"] for m in members if is_shown(m)),
        "dba": sorted_unique(m["dba"] for m in members),
        "domains": sorted_unique(d for m in members for d in m["domains"]),
        "privacy_urls": sorted_unique(m["privacy_url"] for m in members),
        "opt_out_urls": sorted_unique(m["opt_out_url"] for m in members),
        "emails": sorted_unique(e for m in members for e in EMAIL.findall(m["email"])),
        "states": sorted_unique(m["state"] for m in members if len(m["state"]) == 2),
        "countries": countries,
        "in_us_scope": in_us,
        "registries": [{"registry": name, "as_of": as_of} for name, as_of in registries],
        "registered": bool(registries),
        "in_current_california_registry": bool(cppa),
        "california_declarations": {
            "registrant_count": len(cppa),
            "sensitive": sorted_unique(s for c in cppa for s in c["sensitive"]),
            "sold_to": sorted_unique(s for c in cppa for s in c["sold_to"]),
            "regimes": sorted_unique(s for c in cppa for s in c["regimes"]),
            "delete_requests": sum_delete(cppa),
            "comments": sorted_unique(c["comment"] for c in cppa),
        } if cppa else None,
        "prc_collects": dict(sorted(collects.items())),
        "category_hints": sorted_unique(m["category_hint"] for m in members),
        "sources": sorted_unique(m["source"] for m in members),
        "prc_groups": sorted_unique(m["group"] for m in members),
        "record_count": len(members),
        "removed_domains": [{"domain": d, "review": r} for d, r in
                            sorted({(x["domain"], x["review"]) for m in members for x in m.get("removed_domains", [])})],
        "provenance": {
            "aliases": traced(members, lambda m: [m["name"]] if is_shown(m) else []),
            "dba": traced(members, lambda m: [m["dba"]]),
            "domains": traced(members, lambda m: m["domains"]),
            "privacy_urls": traced(members, lambda m: [m["privacy_url"]]),
            "opt_out_urls": traced(members, lambda m: [m["opt_out_url"]]),
            "emails": traced(members, lambda m: EMAIL.findall(m["email"])),
            "states": traced(members, lambda m: [m["state"]] if len(m["state"]) == 2 else []),
            "countries": traced(members, lambda m: [m["country"]]),
            "registries": traced(members, lambda m: [f'{m["registry"]} @ {m["as_of"]}'] if m["registry"] else []),
            "category_hints": traced(members, lambda m: [m["category_hint"]]),
            "california_declarations": sorted_unique(m["source"] for m in members if m["cppa"]),
            "prc_collects": sorted_unique(m["source"] for m in members if m["collects"]),
        },
    }


def drop_wrong_domains(rec):
    review, wrong = WRONG_DOMAINS.get(normalized_name(rec["name"]), ("", set()))
    rec["removed_domains"] = [{"domain": d, "review": review} for d in rec["domains"] if d in wrong]
    rec["domains"] = [d for d in rec["domains"] if d not in wrong]
    rec["keys"] -= {f"domain:{d}" for d in wrong}
    if normalized_name(rec["name"]) in SAME_LEGAL_NAME:
        rec["keys"].add(f'name:{SAME_LEGAL_NAME[normalized_name(rec["name"])]}')


def apply_splits(rec):
    for group, split in SPLITS.items():
        if normalized_name(rec["name"]) in split["names"] or split["domains"] & set(rec["domains"]):
            rec["keys"] = {f"{group}:{key}" for key in rec["keys"]}
            return


def assign_ids(brokers):
    seen = collections.Counter()
    for broker in brokers:
        base = re.sub(r"[^a-z0-9]+", "-", normalized_name(broker["name"])).strip("-")[:48] or "broker"
        seen[base] += 1
        broker["id"] = base if seen[base] == 1 else f"{base}-{seen[base]}"


def parent_candidates(brokers):
    """PRC groups spanning several brokers: possible corporate families, unconfirmed."""
    groups = collections.defaultdict(list)
    for broker in brokers:
        for group in broker["prc_groups"]:
            groups[group].append(broker["name"])
    return {g: sorted(names) for g, names in sorted(groups.items()) if len(names) > 1}


def needs_review(broker):
    """Merges a person should check: many spellings or several domains under one record."""
    reasons = []
    if len(broker["prc_groups"]) > 1:
        reasons.append(f"{len(broker['prc_groups'])} PRC groups")
    names = {normalized_name(a) for a in broker["aliases"]}
    if len(names) > 3:
        reasons.append(f"{len(names)} distinct names")
    if len(broker["domains"]) > 3:
        reasons.append(f"{len(broker['domains'])} domains")
    return reasons


def main():
    records = [*read_cppa(), *read_prc(), *read_texas(), *read_incogwe(), *read_deletewe()]
    records = [r for r in records if r["name"]]
    for rec in records:
        rec["domains"] = sorted(filter(None, map(registrable_domain, split_urls(rec["website"]))))
        rec["keys"] = {f"domain:{d}" for d in rec["domains"]}
        legal = normalized_name(rec["name"])
        if len(legal) >= MIN_LEGAL_NAME_KEY:
            rec["keys"].add(f"name:{legal}")
        brands = []
        for brand in re.split(r"[;,]", rec["dba"]):
            brand = brand.strip()
            domain = registrable_domain(brand) if re.fullmatch(r"[\w.-]+\.[a-zA-Z]{2,}", brand) else None
            if domain:
                rec["domains"].append(domain)
                rec["keys"].add(f"domain:{domain}")
            else:
                brands.append(brand)
        rec["keys"] |= {f"name:{n}" for n in map(normalized_name, brands) if len(n) >= MIN_BRAND_NAME_KEY}

    for rec in records:
        drop_wrong_domains(rec)
        apply_splits(rec)
    brokers = [build_broker(group) for group in cluster(records)]
    brokers.sort(key=lambda b: (normalized_name(b["name"]), b["name"]))
    assign_ids(brokers)

    assigned = sum(b["record_count"] for b in brokers)
    if assigned != len(records):
        sys.exit(f"lost records: {len(records)} in, {assigned} out")
    if len({b["id"] for b in brokers}) != len(brokers):
        sys.exit("duplicate broker ids")

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "brokers.json").write_text(json.dumps(brokers, indent=1, ensure_ascii=False) + "\n")
    with (OUT / "brokers.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["id", "name", "hold_back", "domains", "in_us_scope", "registered", "in_current_california_registry",
                         "registries", "sources", "states", "delete_requests_total", "record_count"])
        for b in brokers:
            ca = b["california_declarations"] or {}
            writer.writerow([b["id"], b["name"], b["hold_back"], ";".join(b["domains"]), b["in_us_scope"], b["registered"],
                             b["in_current_california_registry"],
                             ";".join(r["registry"] for r in b["registries"]), ";".join(b["sources"]),
                             ";".join(b["states"]), ca.get("delete_requests", {}).get("total", ""),
                             b["record_count"]])
    candidates = parent_candidates(brokers)
    with (OUT / "parent-candidates.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["prc_group", "broker_count", "brokers"])
        for group, names in candidates.items():
            writer.writerow([group, len(names), " | ".join(names)])
    with (OUT / "merge-review.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["id", "name", "reasons", "aliases", "domains"])
        for b in brokers:
            reasons = needs_review(b)
            if reasons:
                writer.writerow([b["id"], b["name"], "; ".join(reasons), " | ".join(b["aliases"]), " | ".join(b["domains"])])

    us = [b for b in brokers if b["in_us_scope"]]
    print(f"records in            {len(records)}  {dict(collections.Counter(r['source'] for r in records))}")
    print(f"brokers               {len(brokers)}")
    print(f"in US scope           {len(us)}")
    print(f"out of scope          {[b['name'] for b in brokers if not b['in_us_scope']]}")
    print(f"registered anywhere   {sum(b['registered'] for b in us)}")
    print(f"current CA registry   {sum(b['in_current_california_registry'] for b in us)}")
    print(f"not in any registry   {[b['name'] for b in us if not b['registered']]}")
    print(f"no domain             {sum(not b['domains'] for b in us)}")
    print(f"held back             {[b['name'] for b in brokers if b['hold_back']]}")
    print(f"parent candidates     {len(candidates)}")
    print(f"flagged for review    {sum(bool(needs_review(b)) for b in brokers)}")


if __name__ == "__main__":
    main()
