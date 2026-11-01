import { catalog } from "#lib/server/catalog.ts";

export const load = () => ({ datasets: catalog().datasets });
