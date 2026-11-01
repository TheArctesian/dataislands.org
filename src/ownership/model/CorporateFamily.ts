import type { Company } from "./Company.ts";
import type { OwnershipRecord } from "./OwnershipRecord.ts";

/** Every broker that resolves to one owner. */
export class CorporateFamily {
  readonly owner: Company;
  private readonly members: OwnershipRecord[] = [];

  constructor(owner: Company) {
    this.owner = owner;
  }

  add(record: OwnershipRecord): void {
    this.members.push(record);
  }

  static fromRecords(records: readonly OwnershipRecord[]): CorporateFamily[] {
    const families = new Map<string, CorporateFamily>();
    for (const record of records) {
      if (!record.owner || record.status === "conflict") continue;
      const family = families.get(record.owner.key) ?? new CorporateFamily(record.owner);
      family.add(record);
      families.set(record.owner.key, family);
    }
    return [...families.values()].sort((a, b) => a.owner.key.localeCompare(b.owner.key));
  }

  toJSON() {
    return {
      owner: this.owner,
      members: this.members.map((m) => ({ brokerId: m.broker.id, broker: m.broker.name.value, status: m.status, isNamedOwner: m.isNamedOwner, sources: m.sourceIds })),
    };
  }
}
