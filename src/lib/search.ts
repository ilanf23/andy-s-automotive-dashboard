import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { repairOrders } from "@/data/repairOrders";

export type SearchResultKind = "ro" | "customer" | "vehicle";

export type SearchResult = {
  kind: SearchResultKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

const MAX_RESULTS = 8;

function scoreMatch(haystack: string, needle: string): number {
  if (!haystack) return 0;
  const h = haystack.toLowerCase();
  const idx = h.indexOf(needle);
  if (idx === -1) return 0;
  if (h === needle) return 100;
  if (idx === 0) return 60;
  return 30;
}

function bestScore(fields: Array<string | undefined>, needle: string): number {
  let best = 0;
  for (const f of fields) {
    if (!f) continue;
    const s = scoreMatch(f, needle);
    if (s > best) best = s;
  }
  return best;
}

export function runSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const numericBoost = /^\d+$/.test(q);
  const results: SearchResult[] = [];

  for (const c of customers) {
    const score = bestScore(
      [c.name, c.contactName, c.email, c.phone, c.city],
      q,
    );
    if (score > 0) {
      results.push({
        kind: "customer",
        id: c.id,
        title: c.name,
        subtitle: `${c.type} • ${c.contactName} • ${c.city}, ${c.state}`,
        href: `/customers/${c.id}`,
        score,
      });
    }
  }

  for (const v of vehicles) {
    const score = bestScore(
      [v.unit, v.make, v.model, v.vin, v.licensePlate, String(v.year)],
      q,
    );
    if (score > 0) {
      const customer = customers.find((c) => c.id === v.customerId);
      results.push({
        kind: "vehicle",
        id: v.id,
        title: v.unit,
        subtitle: `${v.year} ${v.make} ${v.model} • ${v.licensePlate}${
          customer ? ` • ${customer.name}` : ""
        }`,
        href: `/vehicles/${v.id}`,
        score,
      });
    }
  }

  for (const ro of repairOrders) {
    const customer = customers.find((c) => c.id === ro.customerId);
    const vehicle = vehicles.find((v) => v.id === ro.vehicleId);
    const direct = bestScore(
      [ro.id, ro.description, ro.status, ...(ro.flags ?? [])],
      q,
    );
    const indirect = bestScore(
      [customer?.name, vehicle?.unit, vehicle?.licensePlate],
      q,
    );
    let score = Math.max(direct, Math.round(indirect * 0.7));
    if (score === 0) continue;
    if (numericBoost && ro.id.toLowerCase().includes(q)) score += 25;
    results.push({
      kind: "ro",
      id: ro.id,
      title: `RO #${ro.id} - ${ro.description}`,
      subtitle: `${customer?.name ?? "Unknown"} • ${vehicle?.unit ?? "Unknown vehicle"} • ${ro.status}`,
      href: `/repair-orders/${ro.id}`,
      score,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, MAX_RESULTS);
}

export const KIND_LABEL: Record<SearchResultKind, string> = {
  ro: "Repair Orders",
  customer: "Customers",
  vehicle: "Vehicles",
};
