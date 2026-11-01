#!/usr/bin/env python3
"""Read each unresolved broker's own legal pages for statements of who runs or owns it.

Honours robots.txt, sends no contact details, and takes no step past a block. Downloads are
cached in data/raw/pages. A hit is a lead for review, not an ownership claim.
"""
import csv
import hashlib
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "raw" / "pages"
OUT = ROOT / "data" / "ownership" / "page-evidence.csv"
USER_AGENT = "dataislands.org public broker atlas"
WORKERS = 8
TIMEOUT_SECONDS = 20
MAX_BYTES = 2_000_000
MAX_PAGES = 3
FALLBACK_PATHS = ("/privacy", "/privacy-policy", "/about")
SNIPPET_WORDS = 14

STATEMENT = re.compile(
    r"(?:owned and operated by|operated by|owned by|a subsidiary of|subsidiary of|a division of|"
    r"division of|an affiliate of|part of|parent company|acquired by|is a [A-Z][\w&.-]*(?: [A-Z][\w&.-]*){0,3} company|"
    r"(?:©|\(c\)|copyright)\s*(?:\d{4}[-–\s]*)+)", re.I)
BOILERPLATE = re.compile(r"\b(?:cookies?|third part|google|facebook|meta|analytics|part of (?:the|our|this|your|a|an) (?:site|service|website|services|process|request|transaction))\b", re.I)


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*"})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return response.status, response.geturl(), response.read(MAX_BYTES)


def allowed(url, robots):
    parts = urllib.parse.urlsplit(url)
    if parts.netloc not in robots:
        parser = RobotFileParser()
        try:
            _, _, body = fetch(f"{parts.scheme}://{parts.netloc}/robots.txt")
            parser.parse(body.decode("utf-8", "replace").splitlines())
        except urllib.error.HTTPError as error:
            parser.parse([] if error.code in (404, 410) else ["User-agent: *", "Disallow: /"])
        except Exception:
            parser.parse([])
        robots[parts.netloc] = parser
    return robots[parts.netloc].can_fetch(USER_AGENT, url)


def page(url, robots):
    path = CACHE / f"{hashlib.sha1(url.encode()).hexdigest()}.json"
    if path.exists():
        return json.loads(path.read_text())
    try:
        if not allowed(url, robots):
            result = {"status": "robots_disallowed", "final_url": url, "text": ""}
        else:
            status, final, body = fetch(url)
            result = {"status": str(status), "final_url": final, "text": visible_text(body)}
    except urllib.error.HTTPError as error:
        result = {"status": str(error.code), "final_url": url, "text": ""}
    except Exception as error:
        result = {"status": f"error:{type(error).__name__}", "final_url": url, "text": ""}
    path.write_text(json.dumps(result))
    return result


def visible_text(raw):
    text = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", raw.decode("utf-8", "replace"), flags=re.S | re.I)
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", text)).split())


def statements(text):
    found = {}
    for match in STATEMENT.finditer(text):
        following = text[match.end():match.end() + 40].split()[:1]
        names_company = match.group(0)[0] in "©(cC" or "parent" in match.group(0).lower() or (following and following[0][0].isupper())
        if not names_company:
            continue
        before = text[max(0, match.start() - 60):match.start()].split()[-3:]
        after = text[match.end():match.end() + 120].split()[:SNIPPET_WORDS - len(before) - 2]
        snippet = " ".join(before + [match.group(0)] + after)
        if not BOILERPLATE.search(snippet):
            found.setdefault(snippet, match.group(0).lower())
    return list(found.items())[:6]


def candidates(broker):
    urls = [u for u in broker["privacy_urls"] if u.startswith("http")]
    for domain in broker["domains"][:2]:
        urls += [f"https://{domain}{path}" for path in FALLBACK_PATHS]
    return list(dict.fromkeys(urls))


def check(broker):
    robots, rows, attempts, read = {}, [], [], 0
    for url in candidates(broker):
        if read >= MAX_PAGES:
            break
        result = page(url, robots)
        attempts.append(f'{url} [{result["status"]}]')
        if result["text"]:
            read += 1
            rows += [[broker["id"], broker["name"], result["final_url"], kind, snippet] for snippet, kind in statements(result["text"])]
        time.sleep(0.5)
    return broker["id"], broker["name"], read, attempts, rows


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    ownership = json.loads((ROOT / "data" / "ownership" / "ownership.json").read_text())
    unknown = {r["brokerId"] for r in ownership if r["status"] == "unknown"}
    brokers = [b for b in json.loads((ROOT / "data" / "census" / "brokers.json").read_text()) if b["id"] in unknown and not b["hold_back"]]
    brokers = brokers[:limit]
    with ThreadPoolExecutor(WORKERS) as pool:
        results = list(pool.map(check, brokers))
    with OUT.open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["broker_id", "broker", "url", "kind", "snippet"])
        writer.writerows(sorted(row for r in results for row in r[4]))
    with OUT.with_name("page-attempts.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["broker_id", "broker", "pages_read", "attempts"])
        writer.writerows(sorted([r[0], r[1], r[2], " | ".join(r[3])] for r in results))
    print(f"brokers checked     {len(results)}")
    print(f"with a page read    {sum(1 for r in results if r[2])}")
    print(f"with a statement    {sum(1 for r in results if r[4])}")
    print(f"no candidate url    {sum(1 for r in results if not r[3])}")


if __name__ == "__main__":
    main()
