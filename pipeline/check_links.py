#!/usr/bin/env python3
"""Check every link the atlas cites. Only 404 and 410 count as broken: a refusal may be bot blocking."""
import csv
import json
import urllib.error
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from operator_pages import allowed, fetch

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "atlas" / "link-check.csv"
WORKERS = 8
# SEC refuses requests without a contact address, and FTC answers scripts with a false 404
# for pages that load in a browser. Check these by hand.
SKIPPED_HOSTS = ("sec.gov", "ftc.gov")


def cited_urls():
    urls = {s["url"]: "evidence" for s in json.loads((ROOT / "data" / "atlas" / "sources.json").read_text())}
    for name in ("sources.csv", "sources-round-2.csv"):
        with (ROOT / "data" / "literature" / name).open(newline="") as handle:
            for row in csv.DictReader(handle):
                urls.setdefault(row["url"], "literature")
    return sorted(urls.items())


def check(item):
    url, used_in = item
    host = urllib.parse.urlsplit(url).netloc
    if host.endswith(SKIPPED_HOSTS):
        return url, used_in, "skipped", ""
    try:
        if not allowed(url, {}):
            return url, used_in, "robots_disallowed", ""
        status, final, _ = fetch(url)
        return url, used_in, "ok", str(status)
    except urllib.error.HTTPError as error:
        return url, used_in, "broken" if error.code in (404, 410) else "refused", str(error.code)
    except Exception as error:
        return url, used_in, "unreachable", type(error).__name__


def main():
    with ThreadPoolExecutor(WORKERS) as pool:
        results = list(pool.map(check, cited_urls()))
    with OUT.open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["url", "used_in", "result", "detail"])
        writer.writerows(results)
    for result in ("ok", "broken", "refused", "unreachable", "robots_disallowed", "skipped"):
        print(f"{result:18} {sum(1 for r in results if r[2] == result)}")


if __name__ == "__main__":
    main()
