export interface SourcedValue<T> {
  value: T;
  sources: string[];
}

export interface BrokerFile {
  id: string;
  name: SourcedValue<string>;
  inUsScope: boolean;
  domains: SourcedValue<string>[];
  privacyUrls: SourcedValue<string>[];
  optOutUrls: SourcedValue<string>[];
  registrations: SourcedValue<string>[];
  dba?: SourcedValue<string>[];
  categoryHints: SourcedValue<string>[];
  californiaDeclarations: SourcedValue<{ sensitive: string[] }> | null;
  prcCollects: SourcedValue<Record<string, boolean>> | null;
}

export interface OwnershipFile {
  brokerId: string;
  status: "ready" | "needs_check" | "conflict" | "unknown";
  isNamedOwner: boolean;
  owner: { key: string; name: string } | null;
  evidence: { source: string; url: string; quote: string; date: string | null } | null;
}

export interface SourceFile {
  id: string;
  kind: string;
  url: string;
  title: string | null;
  publisher: string | null;
  asOf: string | null;
  licence: string | null;
}

export interface PublicOwner {
  key: string;
  name: string;
  isItself: boolean;
  evidenceUrl: string;
  quote: string;
  date: string | null;
}

export interface PublicFact {
  value: string;
  sources: string[];
}

export interface PublicBroker {
  id: string;
  name: string;
  tradesAs: PublicFact[];
  islandSlug: string;
  domains: PublicFact[];
  privacyUrls: PublicFact[];
  optOutUrls: PublicFact[];
  registrations: PublicFact[];
  sensitiveData: PublicFact[];
  collects: PublicFact[];
  owner: PublicOwner | null;
  ownerBeingChecked: boolean;
  categoryEvidence: { url: string; quote: string } | null;
  iconFile: string | null;
}

export interface IslandSummary {
  slug: string;
  name: string;
  description: string;
  brokerCount: number;
  isProvisional: boolean;
}

export interface CategoryFile {
  id: string;
  name: string;
  test: string;
}

export interface CategoryLabel {
  brokerId: string;
  category: string;
  evidenceUrl: string;
  quote: string;
}

const MIN_GROUP_SIZE = 2;
const UNSORTED = { slug: "still-being-sorted", name: "Still being sorted", description: "Brokers we could not place by type of business yet, often because we found no usable description of the company." };
/** Hand-written hints that match a category. background_check and public_records do not, so those brokers wait for evidence. */
const HINT_CATEGORIES: Readonly<Record<string, string>> = {
  people_search: "people-search",
  marketing: "marketing-audiences",
  identity_graph: "adtech-identity",
  financial: "credit-financial",
  risk_mitigation: "fraud-identity-verification",
  risk_fraud: "fraud-identity-verification",
};

/**
 * Decides what the public site may show. An owner appears only with status "ready", and data
 * flows stay out until a reviewed one exists. Absence from a registry is never stated as a finding.
 */
export class PublicAtlas {
  readonly brokers: readonly PublicBroker[];
  readonly islands: readonly IslandSummary[];
  private readonly sourcesById: ReadonlyMap<string, SourceFile>;
  private readonly iconFiles: ReadonlyMap<string, string>;
  private readonly islandFor: (broker: BrokerFile) => { slug: string; evidence: CategoryLabel | null };

  constructor(
    brokers: readonly BrokerFile[],
    ownership: readonly OwnershipFile[],
    sources: readonly SourceFile[],
    categories: readonly CategoryFile[] = [],
    labels: readonly CategoryLabel[] = [],
    iconFiles: ReadonlyMap<string, string> = new Map(),
  ) {
    this.iconFiles = iconFiles;
    const labelled = new Map(labels.map((label) => [label.brokerId, label]));
    const known = new Set(categories.map((category) => category.id));
    this.islandFor = (broker) => {
      const label = labelled.get(broker.id)?.category;
      if (label && known.has(label)) return { slug: label, evidence: labelled.get(broker.id)! };
      const hint = broker.categoryHints.map((fact) => HINT_CATEGORIES[fact.value]).find((slug) => slug && known.has(slug));
      return { slug: hint ?? UNSORTED.slug, evidence: null };
    };
    const owners = new Map(ownership.map((record) => [record.brokerId, record]));
    this.sourcesById = new Map(sources.map((source) => [source.id, source]));
    this.brokers = brokers
      .filter((broker) => broker.inUsScope)
      .map((broker) => this.present(broker, owners.get(broker.id)))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
    const places = [...categories.map((c) => ({ slug: c.id, name: c.name, description: c.test })), UNSORTED];
    this.islands = places
      .map((island) => ({
        slug: island.slug,
        name: island.name,
        description: island.description,
        brokerCount: this.brokers.filter((broker) => broker.islandSlug === island.slug).length,
        isProvisional: island.slug === UNSORTED.slug,
      }))
      .filter((island) => island.brokerCount > 0);
  }

  /** Owners with several verified brokers. Unverified links stay out, so a group may be larger in reality. */
  get ownerGroups(): IslandSummary[] {
    const groups = new Map<string, PublicBroker[]>();
    for (const broker of this.brokers) {
      if (broker.owner) groups.set(broker.owner.key, [...(groups.get(broker.owner.key) ?? []), broker]);
    }
    return [...groups.entries()]
      .filter(([, members]) => members.length >= MIN_GROUP_SIZE)
      .map(([key, members]) => ({
        slug: key.replace(/\s+/g, "-"),
        name: members[0]!.owner!.name,
        description: "Companies we could verify as part of this group. It may own others we have not confirmed.",
        brokerCount: members.length,
        isProvisional: false,
      }))
      .sort((a, b) => b.brokerCount - a.brokerCount || a.name.localeCompare(b.name, "en"));
  }

  brokersOwnedBy(slug: string): PublicBroker[] {
    return this.brokers.filter((broker) => broker.owner?.key.replace(/\s+/g, "-") === slug);
  }

  broker(id: string): PublicBroker | undefined {
    return this.brokers.find((broker) => broker.id === id);
  }

  island(slug: string): IslandSummary | undefined {
    return this.islands.find((island) => island.slug === slug);
  }

  brokersOn(slug: string): PublicBroker[] {
    return this.brokers.filter((broker) => broker.islandSlug === slug);
  }

  /** Only what the atlas actually cites, with datasets first. */
  citedSources(ids: readonly string[]): SourceFile[] {
    return [...new Set(ids)].flatMap((id) => this.sourcesById.get(id) ?? []).sort((a, b) => (a.title ? 0 : 1) - (b.title ? 0 : 1));
  }

  get datasets(): SourceFile[] {
    return [...this.sourcesById.values()].filter((source) => source.title);
  }

  private present(broker: BrokerFile, record: OwnershipFile | undefined): PublicBroker {
    const links = (facts: SourcedValue<string>[]) => {
      const split = facts.flatMap((fact) => fact.value.split(/[;,\s]+/).map((value) => ({ value, sources: fact.sources })));
      const usable = split.filter((fact) => /^https?:\/\//.test(fact.value) && URL.canParse(fact.value));
      return [...new Map(usable.map((fact) => [fact.value, fact])).values()];
    };
    const declarations = broker.californiaDeclarations;
    const collects = broker.prcCollects;
    const place = this.islandFor(broker);
    return {
      id: broker.id,
      name: broker.name.value,
      islandSlug: place.slug,
      iconFile: this.iconFiles.get(broker.id) ?? null,
      categoryEvidence: place.evidence && { url: place.evidence.evidenceUrl, quote: place.evidence.quote },
      tradesAs: (broker.dba ?? []).filter((fact) => fact.value.toLowerCase() !== broker.name.value.toLowerCase()),
      domains: broker.domains,
      privacyUrls: links(broker.privacyUrls),
      optOutUrls: links(broker.optOutUrls),
      registrations: broker.registrations.map((fact) => ({ ...fact, value: fact.value.replace(" @ ", ", as of ") })),
      sensitiveData: declarations ? declarations.value.sensitive.map((value) => ({ value: value.replaceAll("_", " "), sources: declarations.sources })) : [],
      collects: collects ? Object.entries(collects.value).filter(([, held]) => held).map(([value]) => ({ value: value.replaceAll("_", " "), sources: collects.sources })) : [],
      owner: this.ownerFrom(record),
      ownerBeingChecked: record?.status === "needs_check" || record?.status === "conflict",
    };
  }

  private ownerFrom(record: OwnershipFile | undefined): PublicOwner | null {
    if (record?.status !== "ready" || !record.owner || !record.evidence) return null;
    return {
      key: record.owner.key,
      name: record.owner.name,
      isItself: record.isNamedOwner,
      evidenceUrl: record.evidence.url,
      quote: record.evidence.quote,
      date: record.evidence.date,
    };
  }
}
