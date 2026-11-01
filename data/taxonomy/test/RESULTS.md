# 50-broker category test

Run on 31 October 2026. Sonnet and Haiku classified the same 50 US brokers separately, using only `packets.json`. Neither saw the existing hints or the other's answers. Labels are not published or applied to the site.

## Results

| Measure | Result |
|---|---|
| Same answer, including both `unclear` | 44 of 50 |
| Both `unclear` | 19 |
| Both gave a category | 27, and 25 of those matched |
| Both rated `high` | 16, and all 16 matched |
| Same category with both at `medium` or better | 22 |
| Quotes checked against the cited excerpt | 58 of 58 found |

The 22 are the only labels that would pass the proposed rule.

## Disagreements

| Broker | Sonnet | Haiku |
|---|---|---|
| Great Lakes List | marketing-audiences, low | unclear |
| InfoPay | people-search, medium | unclear |
| TowerData | adtech-identity, medium | fraud-identity-verification, high |
| Solar Connect | marketing-audiences, low | unclear |
| Indiemark | unclear | fraud-identity-verification, medium |
| Tunnl | marketing-audiences, low | adtech-identity, medium |

## What it showed

- Missing evidence is the main limit. 10 packets had no page text, including 5 brokers with existing hints, because the page script only read brokers then marked `unknown`.
- Hints are a thin check: 2 match, Intelius differs, and 7 went `unclear`. Intelius has a `background_check` hint and both agents chose people-search.
- Graze Social, Swipejobs, AdeptID and Vertify fit no category, and both agents left them `unclear`.
- Insurance-auto and breach-security were never used as a primary. 50 is too small to justify removing them.
- Neither model is clearly better. Sonnet labelled some from names alone, against the brief. Haiku rated some thin evidence higher.
