import assert from "node:assert/strict";
import { test } from "node:test";
import { Citations, dataTypeName, distinctLinks, linkLabel, otherDataTypes, readableDate, registryRows } from "../src/lib/atlas/brokerFacts.ts";

test("a page already given as the opt-out is not listed again, and repeats keep their sources", () => {
  const out = [{ value: "https://www.a.test/opt-out/", sources: ["prc"] }];
  const privacy = [
    { value: "https://a.test/opt-out", sources: ["cppa"] },
    { value: "https://a.test/privacy", sources: ["cppa"] },
    { value: "https://www.a.test/privacy/", sources: ["prc"] },
  ];
  assert.deepEqual(distinctLinks(privacy, out), [{ value: "https://a.test/privacy", sources: ["cppa", "prc"] }]);
});

test("addresses read without their protocol", () => {
  assert.equal(linkLabel("https://www.a.test/opt-out/"), "a.test/opt-out");
});

test("sources are numbered by first use and shared across facts", () => {
  const citations = new Citations([{ sources: ["b"] }, { sources: ["a", "b"] }]);
  assert.deepEqual(citations.list, [{ number: 1, id: "b" }, { number: 2, id: "a" }]);
  assert.deepEqual(citations.of({ sources: ["a"] }, { sources: ["b"] }, { sources: ["a"] }), [1, 2]);
});

test("each state shows its latest registry record", () => {
  const rows = registryRows([
    { value: "Texas, as of 2025-04", sources: ["prc"] },
    { value: "California (Attorney General), as of 2025-04", sources: ["prc"] },
    { value: "California (CPPA), as of 2026-10-30", sources: ["cppa"] },
    { value: "Texas (live), as of 2026-10-30", sources: ["texas"] },
    { value: "Vermont, as of 2025-04", sources: ["prc"] },
  ]);
  assert.deepEqual(rows, [
    { state: "California", asOf: "30 Oct 2026", sources: ["cppa"] },
    { state: "Texas", asOf: "30 Oct 2026", sources: ["texas"] },
    { state: "Vermont", asOf: "Apr 2025", sources: ["prc"] },
  ]);
});

test("data types read as words, and what a company declared is not repeated", () => {
  assert.equal(readableDate("2025-04"), "Apr 2025");
  assert.equal(dataTypeName("government id"), "Government ID");
  assert.equal(dataTypeName("minors"), "Data about minors");
  const fact = (value: string) => ({ value, sources: ["prc"] });
  assert.deepEqual(otherDataTypes([fact("other"), fact("minors"), fact("names")], [fact("minors")]).map((item) => item.value), ["names", "other"]);
});
