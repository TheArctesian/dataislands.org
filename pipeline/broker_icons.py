#!/usr/bin/env python3
"""Download each US broker's icon from its own domain, for hosting on the site.

Honours robots.txt. A redirect to another company's domain gives no icon, because the icon would
describe that company. Files are checked by their bytes and never executed.
"""
import collections
import csv
import hashlib
import html
import json
import re
import sys
import urllib.error
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from operator_pages import WORKERS, allowed, fetch

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "static" / "icons"
MANIFEST = ROOT / "data" / "atlas" / "icons.csv"
MAX_ICON_BYTES = 200_000
MAX_DOMAINS = 2
# The same file on many unrelated domains is a website builder's default, not the company's icon.
GENERIC_DOMAIN_COUNT = 4
LINK = re.compile(r"<link\b[^>]*>", re.I)
EVENT_OR_SCRIPT = re.compile(rb"<script|\son\w+\s*=|javascript:|<foreignObject", re.I)


def attribute(tag, name):
    found = re.search(rf"""{name}\s*=\s*["']?([^"'\s>]+)""", tag, re.I)
    return html.unescape(found.group(1)) if found else ""


def root_of(url):
    return ".".join((urllib.parse.urlsplit(url).hostname or "").lower().removeprefix("www.").split(".")[-2:])


def extension(body):
    if body.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if body.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if body.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if body[:4] == b"RIFF" and body[8:12] == b"WEBP":
        return "webp"
    if body.startswith(b"\x00\x00\x01\x00"):
        return "ico"
    head = body[:2000].lstrip().lower()
    if (head.startswith(b"<svg") or (head.startswith(b"<?xml") and b"<svg" in head)) and not EVENT_OR_SCRIPT.search(body):
        return "svg"
    return None


def declared_sizes(tag):
    sizes = re.findall(r"(\d+)x\d+", attribute(tag, "sizes"))
    return max(map(int, sizes), default=0)


def candidates(page_url, page_html):
    icons = []
    for tag in LINK.findall(page_html):
        quoted = re.search(r"""rel\s*=\s*["']([^"']+)""", tag, re.I)
        rel = (quoted.group(1) if quoted else attribute(tag, "rel")).lower()
        href = attribute(tag, "href")
        if href and "icon" in rel and not href.startswith("data:"):
            icons.append((("apple-touch" in rel) * 180 or declared_sizes(tag), urllib.parse.urljoin(page_url, href)))
    ordered = [url for _, url in sorted(icons, key=lambda item: -item[0])]
    return ordered + [urllib.parse.urljoin(page_url, "/favicon.ico")]


def icon_for(broker):
    robots, outcome = {}, "no_domain"
    for fact in broker["domains"][:MAX_DOMAINS]:
        home = f'https://{fact["value"]}/'
        try:
            if not allowed(home, robots):
                outcome = "robots_disallowed"
                continue
            _, final, body = fetch(home)
        except urllib.error.HTTPError as error:
            outcome = f"http_{error.code}"
            continue
        except Exception as error:
            outcome = f"error:{type(error).__name__}"
            continue
        own = {root_of(f'https://{f["value"]}/') for f in broker["domains"]}
        if root_of(final) not in own:
            outcome = "redirects_elsewhere"
            continue
        outcome = "no_usable_icon"
        for url in candidates(final, body.decode("utf-8", "replace")):
            try:
                if not allowed(url, robots):
                    continue
                _, icon_final, data = fetch(url)
            except Exception:
                continue
            kind = extension(data)
            if kind and 0 < len(data) <= MAX_ICON_BYTES:
                return {"id": broker["id"], "status": "found", "source_url": icon_final, "kind": kind, "data": data, "page": final}
    return {"id": broker["id"], "status": outcome, "source_url": "", "kind": "", "data": b"", "page": ""}


def main():
    brokers = [b for b in json.loads((ROOT / "data" / "atlas" / "brokers.json").read_text()) if b["inUsScope"]]
    brokers = brokers[:int(sys.argv[1])] if len(sys.argv) > 1 else brokers
    with ThreadPoolExecutor(WORKERS) as pool:
        results = list(pool.map(icon_for, brokers))
    domains_by_hash = collections.defaultdict(set)
    for result in results:
        if result["data"]:
            domains_by_hash[hashlib.sha1(result["data"]).hexdigest()].add(root_of(result["page"]))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*"):
        old.unlink()
    rows = []
    for result in sorted(results, key=lambda r: r["id"]):
        status, file_name = result["status"], ""
        if result["data"] and ("/wp-includes/" in result["source_url"] or len(domains_by_hash[hashlib.sha1(result["data"]).hexdigest()]) >= GENERIC_DOMAIN_COUNT):
            status = "generic_icon"
        elif result["data"]:
            file_name = f'{result["id"]}.{result["kind"]}'
            (OUT_DIR / file_name).write_bytes(result["data"])
        rows.append({"broker_id": result["id"], "status": status, "file": file_name, "source_url": result["source_url"]})
    with MANIFEST.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(collections.Counter(row["status"].split(":")[0] for row in rows).most_common())


if __name__ == "__main__":
    main()
