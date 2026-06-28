import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import {
  OrcamentoHistory,
  mapHistoryStatus,
  getClientNameFromSnapshot,
  getPeriodBounds,
  mapFilterStatusToDb,
} from "@/lib/orcamentos-helpers";

export interface UseOrcamentosHistoryParams {
  search: string;
  status: "todos" | "aprovado" | "pendente" | "cancelado" | "rascunho";
  periodo: "este-mes" | "mes-anterior" | "ultimos-3";
  page: number;
  pageSize: number;
}

export interface UseOrcamentosHistoryResult {
  data: OrcamentoHistory[];
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

export function useOrcamentosHistory({
  search,
  status,
  periodo,
  page,
  pageSize,
}: UseOrcamentosHistoryParams): UseOrcamentosHistoryResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orcamentos-history", search, status, periodo, page, pageSize],
    queryFn: async () => {
      const periodBounds = getPeriodBounds(periodo);

      // Build base query
      let query = supabase
        .from("orcamentos")
        .select("id, numero, status, total, created_at, cliente_snapshot, cliente_id", { count: "exact" })
        .gte("created_at", periodBounds.start.toISOString())
        .lte("created_at", periodBounds.end.toISOString())
        .order("created_at", { ascending: false });

      // Apply status filter
      if (status !== "todos") {
        const dbStatus = mapFilterStatusToDb(status);
        query = query.eq("status", dbStatus);
      }

      // Apply search filter
      if (search.trim()) {
        const searchNum = parseInt(search.trim(), 10);
        if (!isNaN(searchNum)) {
          // Search by numero (exact match for numbers)
          query = query.eq("numero", searchNum);
        } else {
          // Search by client name in cliente_snapshot using ilike
          // Use a postgres text search on the jsonb field
          query = query.ilike("cliente_snapshot->>nome", `%${search.trim()}%`);
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: rawData, count, error } = await query;

      if (error) throw error;

      // Transform data
      const history: OrcamentoHistory[] = (rawData || []).map((o) => ({
        id: o.id,
        numero: o.numero,
        cliente: getClientNameFromSnapshot(o.cliente_snapshot),
        data: format(parseISO(o.created_at), "yyyy-MM-dd"),
        valor: o.total || 0,
        status: mapHistoryStatus(o.status),
      }));

      const totalCount = count || 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      return {
        data: history,
        totalCount,
        totalPages,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (prev) => prev,
  });

  return {
    data: data?.data || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    error: error as Error | null,
  };
}
