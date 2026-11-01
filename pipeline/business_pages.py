#!/usr/bin/env python3
"""Read each US broker's homepage and about page, which describe the business better than a privacy policy.

Shares the cache and the robots.txt handling of operator_pages. Failed reads are retried on each run.
"""
import csv
import hashlib
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from operator_pages import CACHE, ROOT, WORKERS, page

OUT = ROOT / "data" / "taxonomy" / "business-page-attempts.csv"
PATHS = ("/", "/about", "/about-us")
MAX_DOMAINS = 2


def forget_failure(url):
    path = CACHE / f"{hashlib.sha1(url.encode()).hexdigest()}.json"
    if path.exists() and not json.loads(path.read_text())["text"]:
        path.unlink()


def check(broker):
    robots, attempts, read = {}, [], 0
    for fact in broker["domains"][:MAX_DOMAINS]:
        for suffix in PATHS:
            url = f'https://{fact["value"]}{suffix}'
            forget_failure(url)
            result = page(url, robots)
            attempts.append(f'{url} [{result["status"]}]')
            read += bool(result["text"])
            time.sleep(0.5)
    return broker["id"], broker["name"]["value"], read, " | ".join(attempts)


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    brokers = [b for b in json.loads((ROOT / "data" / "atlas" / "brokers.json").read_text()) if b["inUsScope"]]
    brokers = brokers[:int(sys.argv[1])] if len(sys.argv) > 1 else brokers
    with ThreadPoolExecutor(WORKERS) as pool:
        results = list(pool.map(check, brokers))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["broker_id", "broker", "pages_read", "attempts"])
        writer.writerows(sorted(results))
    print(f"brokers             {len(results)}")
    print(f"with a page read    {sum(1 for r in results if r[2])}")
    print(f"no domain           {sum(1 for r in results if not r[3])}")


if __name__ == "__main__":
    main()
