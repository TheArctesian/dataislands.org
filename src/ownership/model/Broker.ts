import { Company } from "./Company.ts";
import { type SourceCatalog, Sourced } from "./Source.ts";

type Traced = Record<string, string[]>;

export interface CensusBroker {
  id: string;
  name: string;
  aliases: string[];
  dba: string[];
  domains: string[];
  hold_back: boolean;
  in_us_scope: boolean;
  california_declarations: { comments: string[] } | null;
  prc_collects: Record<string, boolean>;
  removed_domains: { domain: string; review: string }[];
  provenance: {
    aliases: Traced; dba: Traced; domains: Traced; privacy_urls: Traced; opt_out_urls: Traced;
    states: Traced; countries: Traced; registries: Traced; category_hints: Traced;
    california_declarations: string[]; prc_collects: string[];
  };
}

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

/** A census entry whose every published fact names the sources that declared it. */
export class Broker {
  readonly id: string;
  readonly name: Sourced<string>;
  readonly inUsScope: boolean;
  readonly heldBack: boolean;
  readonly removedDomains: readonly { domain: string; review: string }[];
  private readonly facts: Record<string, unknown>;
  private readonly nameKeys: ReadonlySet<string>;

  constructor(record: CensusBroker, catalog: SourceCatalog) {
    const { provenance } = record;
    const each = (traced: Traced) =>
      Object.entries(traced).map(([value, ids]) => new Sourced(value, ids.map((id) => catalog.get(id))));
    const links = (traced: Traced) => each(traced).filter((fact) => /^https?:\/\//.test(fact.value));
    const whole = <T>(value: T, ids: string[]) => (ids.length ? new Sourced(value, ids.map((id) => catalog.get(id))) : null);

    this.id = record.id;
    this.name = new Sourced(record.name, (provenance.aliases[record.name] ?? []).map((id) => catalog.get(id)));
    this.inUsScope = record.in_us_scope;
    this.heldBack = record.hold_back;
    this.removedDomains = record.removed_domains;
    this.nameKeys = new Set([record.name, ...record.aliases, ...record.dba].map(Company.keyOf));
    this.facts = {
      aliases: each(provenance.aliases),
      dba: each(provenance.dba),
      domains: each(provenance.domains),
      privacyUrls: links(provenance.privacy_urls),
      optOutUrls: links(provenance.opt_out_urls),
      states: each(provenance.states),
      countries: each(provenance.countries),
      registrations: each(provenance.registries),
      categoryHints: each(provenance.category_hints),
      californiaDeclarations: whole(
        record.california_declarations && {
          ...record.california_declarations,
          comments: record.california_declarations.comments.map((c) => c.replace(EMAIL, "[email removed]")),
        },
        provenance.california_declarations,
      ),
      prcCollects: whole(record.prc_collects, provenance.prc_collects),
    };
  }

  isKnownAs(company: Company): boolean {
    return this.nameKeys.has(company.key);
  }

  get names(): ReadonlySet<string> {
    return this.nameKeys;
  }

  toJSON() {
    return { id: this.id, name: this.name, inUsScope: this.inUsScope, ...this.facts, removedDomains: this.removedDomains };
  }
}

/** Finds a census broker from the older ids and bare names that review files used. */
export class BrokerIndex {
  private readonly byId = new Map<string, Broker>();
  private readonly byName = new Map<string, Broker[]>();
  private readonly idRemap: Readonly<Record<string, string>>;
  private readonly nameRemap: Readonly<Record<string, string>>;

  constructor(brokers: Broker[], idRemap: Readonly<Record<string, string>>, nameRemap: Readonly<Record<string, string>>) {
    this.idRemap = idRemap;
    this.nameRemap = nameRemap;
    for (const broker of brokers) {
      this.byId.set(broker.id, broker);
      for (const key of broker.names) this.byName.set(key, [...(this.byName.get(key) ?? []), broker]);
    }
  }

  get all(): Broker[] {
    return [...this.byId.values()];
  }

  withId(id: string): Broker | null {
    return this.byId.get(this.idRemap[id] ?? id) ?? null;
  }

  /** An ambiguous name returns null rather than guessing which company a claim is about. */
  named(name: string): Broker | null {
    const remapped = this.nameRemap[name];
    if (remapped) return this.withId(remapped);
    const matches = this.byName.get(Company.keyOf(name)) ?? [];
    return matches.length === 1 ? matches[0]! : null;
  }
}
