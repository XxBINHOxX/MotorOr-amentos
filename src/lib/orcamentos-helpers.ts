import { startOfMonth, endOfMonth, subMonths } from "date-fns";

// Shared types for orcamentos
export interface OrcamentoHistory {
  id: string;
  numero: number;
  cliente: string;
  data: string;
  valor: number;
  status: "aprovado" | "pendente" | "cancelado" | "rascunho";
}

// Helper to map history status (recusado -> cancelado for display)
export function mapHistoryStatus(status: string): OrcamentoHistory["status"] {
  if (status === "recusado") return "cancelado";
  if (status === "rascunho") return "rascunho";
  return status as OrcamentoHistory["status"];
}

// Map UI status filter to database status value
export function mapFilterStatusToDb(status: string): string {
  if (status === "cancelado") return "recusado";
  return status;
}

// Helper to get client name from snapshot or fetched data
export function getClientName(
  item: { cliente_id?: string | null; cliente_snapshot?: unknown } | null,
  clientesMap?: Record<string, string>
): string {
  if (!item) return "Cliente não informado";
  if (item.cliente_id && clientesMap?.[item.cliente_id]) {
    return clientesMap[item.cliente_id];
  }
  if (item.cliente_snapshot && typeof item.cliente_snapshot === "object" && item.cliente_snapshot !== null) {
    const snapshot = item.cliente_snapshot as Record<string, unknown>;
    return (snapshot.nome as string) || (snapshot.empresa as string) || "Cliente não informado";
  }
  return "Cliente não informado";
}

// Get client name directly from snapshot only (for server-side queries)
export function getClientNameFromSnapshot(snapshot: unknown): string {
  if (snapshot && typeof snapshot === "object" && snapshot !== null) {
    const s = snapshot as Record<string, unknown>;
    return (s.nome as string) || (s.empresa as string) || "Cliente não informado";
  }
  return "Cliente não informado";
}

// Get period boundaries for filtering
export function getPeriodBounds(period: string, referenceDate?: Date) {
  const now = referenceDate || new Date();
  switch (period) {
    case "este-mes":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "mes-anterior":
      const prevMonth = subMonths(now, 1);
      return { start: startOfMonth(prevMonth), end: endOfMonth(prevMonth) };
    case "ultimos-3":
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}
