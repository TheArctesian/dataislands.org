#!/usr/bin/env python3
"""Accept a category only when both classifiers agree at medium or better, on a page from the broker's own domain."""
import collections
import csv
import glob
import hashlib
import json
import re
import urllib.parse
from pathlib import Path

from operator_pages import page

ROOT = Path(__file__).resolve().parent.parent
FULL = ROOT / "data" / "taxonomy" / "full"
OUT = ROOT / "data" / "taxonomy" / "categories.csv"
CACHE = ROOT / "data" / "raw" / "pages"
GOOD = {"high", "medium"}
RESORT = ROOT / "data" / "taxonomy" / "resort"
OLD_CATCH_ALL = "other-data-businesses"
FALLBACK = "data-role-unclear"
# The spot-check read these pages and found no tie to the named broker.
SPOT_CHECK_HOLDS = {"vertical-int", "iq-data-systems", "labels-and-lists", "iso-claims-services", "dallas-computer-services"}
# Words that say nothing about which company a page is about.
COMMON_WORDS = {"data", "the", "and", "inc", "llc", "ltd", "corp", "company", "group", "services", "solutions", "systems", "marketing", "media", "information", "technologies", "technology", "digital", "lists", "list"}


def results(model, folder=FULL):
    rows = {}
    for path in sorted(glob.glob(str(folder / f"results-{model}-*.csv"))):
        with open(path, newline="") as handle:
            rows.update({row["broker_id"]: row for row in csv.DictReader(handle)})
    return rows


def root_of(host):
    parts = host.lower().removeprefix("www.").split(".")
    return ".".join(parts[-2:])


def page_text(packets, broker_id):
    return " ".join(e["text"] for e in packets[broker_id]["page_excerpts"]).lower()


def names_broker(text, broker):
    """A spot-check found pages that never name the broker, so its label may describe another company."""
    names = [broker["name"]["value"]] + [f["value"] for f in broker["aliases"] + broker["dba"]]
    words = {w for n in names for w in re.findall(r"[a-z0-9]{3,}", n.lower())} - COMMON_WORDS
    roots = {f["value"].split(".")[0].lower() for f in broker["domains"]}
    squeezed = text.replace(" ", "")
    return any(re.search(rf"\b{re.escape(w)}\b", text) for w in words) or any(r in squeezed for r in roots if len(r) >= 4)


def decide(sonnet, haiku, domains):
    if sonnet["primary"] == "unclear" and haiku["primary"] == "unclear":
        return "both_unclear"
    if sonnet["primary"] != haiku["primary"]:
        return "disagree"
    if sonnet["confidence"] not in GOOD or haiku["confidence"] not in GOOD:
        return "low_confidence"
    own = {root_of(d) for d in domains}
    hosts = [root_of(urllib.parse.urlsplit(r["evidence_url"]).hostname or "") for r in (sonnet, haiku)]
    return "accepted" if all(host in own for host in hosts) else "other_domain"


def decision(s, h, domains, broker, packets):
    outcome = decide(s, h, domains)
    if outcome == "accepted" and broker["id"] in SPOT_CHECK_HOLDS:
        return "spot_check_hold"
    if outcome == "accepted" and not names_broker(page_text(packets, broker["id"]), broker):
        return "broker_not_named"
    return outcome


def reviewed():
    rows = {}
    for path in sorted(glob.glob(str(ROOT / "data" / "taxonomy" / "review" / "results-*.csv"))):
        with open(path, newline="") as handle:
            rows.update({row["broker_id"]: row for row in csv.DictReader(handle)})
    return rows


def squeeze(text):
    return " ".join(text.lower().replace("’", "'").split())


def quote_on_page(row):
    """Review agents read pages through a summariser, so a quote is shown only if the raw page has it."""
    return bool(row["evidence_quote"]) and squeeze(row["evidence_quote"]) in squeeze(page(row["evidence_url"], {})["text"])


def settle(row, review, domains):
    if not review or review["primary"] == "unclear":
        return
    own = {root_of(d) for d in domains}
    host = root_of(urllib.parse.urlsplit(review["evidence_url"]).hostname or "")
    usable = review["confidence"] in GOOD and review["evidence_opened"] == "true" and review["names_broker"] == "true" and host in own
    row["decision"] = "review_accepted" if usable else "review_rejected"
    if usable:
        row.update(category=review["primary"], secondary=review["secondary"], evidence_url=review["evidence_url"],
                   evidence_quote=review["evidence_quote"] if quote_on_page(review) else "", reason=review["note"])


def resort(row, sonnet, haiku, domains):
    """A broker leaves the old catch-all only when both readers agree on a new category."""
    row["category"] = FALLBACK
    if decide(sonnet, haiku, domains) == "accepted" and sonnet["primary"] != FALLBACK:
        row.update(category=sonnet["primary"], secondary=sonnet["secondary"] if sonnet["secondary"] == haiku["secondary"] else "",
                   evidence_url=sonnet["evidence_url"], evidence_quote=sonnet["evidence_quote"], reason=sonnet["reason"])


def main():
    sonnet, haiku = results("sonnet"), results("haiku")
    brokers = {b["id"]: b for b in json.loads((ROOT / "data" / "atlas" / "brokers.json").read_text())}
    packets = {p["broker_id"]: p for path in glob.glob(str(FULL / "packets-*.json")) for p in json.loads(Path(path).read_text())}
    rows = []
    for broker_id in sorted(sonnet):
        s, h = sonnet[broker_id], haiku[broker_id]
        domains = [fact["value"] for fact in brokers[broker_id]["domains"]]
        rows.append({
            "broker_id": broker_id, "broker": brokers[broker_id]["name"]["value"], "decision": decision(s, h, domains, brokers[broker_id], packets),
            "sonnet": s["primary"], "sonnet_confidence": s["confidence"], "haiku": h["primary"], "haiku_confidence": h["confidence"],
            "secondary": s["secondary"] if s["secondary"] == h["secondary"] else "",
            "category": s["primary"], "evidence_url": s["evidence_url"], "evidence_quote": s["evidence_quote"], "reason": s["reason"],
        })
    review = reviewed()
    for row in rows:
        if row["decision"] == "disagree":
            settle(row, review.get(row["broker_id"]), [fact["value"] for fact in brokers[row["broker_id"]]["domains"]])
    resort_sonnet, resort_haiku = results("sonnet", RESORT), results("haiku", RESORT)
    for row in rows:
        if row["decision"] in ("accepted", "review_accepted") and row["category"] == OLD_CATCH_ALL:
            broker_id = row["broker_id"]
            resort(row, resort_sonnet[broker_id], resort_haiku[broker_id], [fact["value"] for fact in brokers[broker_id]["domains"]])
    with OUT.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(collections.Counter(r["decision"] for r in rows))
    print(collections.Counter(r["category"] for r in rows if r["decision"] in ("accepted", "review_accepted")).most_common())


if __name__ == "__main__":
    main()
