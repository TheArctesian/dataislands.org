#!/usr/bin/env python3
"""Build the evidence packets that classifiers read: registry facts plus the broker's own pages."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "raw" / "pages"
OUT = ROOT / "data" / "taxonomy" / "full"
BATCH_SIZE = 40
MAX_EXCERPTS = 3
EXCERPT_CHARS = 1200


def cached(url):
    path = CACHE / f"{hashlib.sha1(url.encode()).hexdigest()}.json"
    return json.loads(path.read_text()) if path.exists() else None


def excerpts(broker):
    urls = []
    for fact in broker["domains"][:2]:
        urls += [f'https://{fact["value"]}{suffix}' for suffix in ("/about", "/about-us", "/")]
    urls += [fact["value"] for fact in broker["privacyUrls"]]
    urls += [f'https://{fact["value"]}{suffix}' for fact in broker["domains"][:2] for suffix in ("/privacy", "/privacy-policy")]
    found, texts = [], set()
    for url in dict.fromkeys(urls):
        page = cached(url)
        if page and page["text"] and page["text"][:300] not in texts:
            texts.add(page["text"][:300])
            found.append({"url": page["final_url"], "text": page["text"][:EXCERPT_CHARS]})
    return found[:MAX_EXCERPTS]


def main():
    brokers = [b for b in json.loads((ROOT / "data" / "atlas" / "brokers.json").read_text()) if b["inUsScope"]]
    packets, empty = [], []
    for broker in brokers:
        found = excerpts(broker)
        if not found:
            empty.append(broker["id"])
            continue
        declared = broker["californiaDeclarations"]["value"] if broker["californiaDeclarations"] else None
        packets.append({
            "broker_id": broker["id"],
            "name": broker["name"]["value"],
            "other_names": [fact["value"] for fact in broker["aliases"]][:6],
            "domains": [fact["value"] for fact in broker["domains"]][:6],
            "california": {key: declared[key] for key in ("sensitive", "sold_to", "regimes")} if declared else None,
            "page_excerpts": found,
        })
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "no-evidence.json").write_text(json.dumps(sorted(empty), indent=1))
    batches = [packets[i:i + BATCH_SIZE] for i in range(0, len(packets), BATCH_SIZE)]
    for index, batch in enumerate(batches, 1):
        (OUT / f"packets-{index:02d}.json").write_text(json.dumps(batch, indent=1))
    print(f"brokers {len(brokers)}  packets {len(packets)}  no evidence {len(empty)}  batches {len(batches)}")


if __name__ == "__main__":
    main()
