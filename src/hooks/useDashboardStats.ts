import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types matching the mock data structures
export interface KPIData {
  label: string;
  value: string | number;
  variation: number;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  day: number;
  approved: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  numero: number;
  cliente: string;
  action: "editado" | "aprovado" | "rejeitado" | "criado";
  timeAgo: string;
}

export interface ServiceRank {
  rank: number;
  name: string;
  count: number;
  percentage: number;
}

export interface FinancialSummary {
  totalOrcado: number;
  valorAprovado: number;
  valorEmAnalise: number;
  valorRejeitado: number;
  taxaAprovacao: number;
}

export interface DraftOrcamento {
  numero: number;
  cliente: string;
  motor: string;
  progress: number;
  lastEdit: string;
}

export interface OrcamentoHistory {
  id: string;
  numero: number;
  cliente: string;
  data: string;
  valor: number;
  status: "aprovado" | "pendente" | "cancelado" | "rascunho";
}

export interface DashboardStats {
  kpis: KPIData[];
  chartData: ChartDataPoint[];
  activities: ActivityItem[];
  topServices: ServiceRank[];
  financial: FinancialSummary;
  draft: DraftOrcamento | null;
  history: OrcamentoHistory[];
}

// Helper to get month boundaries
function getMonthBounds(date: Date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

// Helper to map status to action
function statusToAction(status: string): ActivityItem["action"] {
  switch (status) {
    case "aprovado":
      return "aprovado";
    case "recusado":
      return "rejeitado";
    case "rascunho":
      return "editado";
    default:
      return "criado";
  }
}

// Helper to map history status (recusado -> cancelado for display)
function mapHistoryStatus(status: string): OrcamentoHistory["status"] {
  if (status === "recusado") return "cancelado";
  if (status === "rascunho") return "rascunho";
  return status as OrcamentoHistory["status"];
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const now = new Date();
      const currentMonth = getMonthBounds(now);
      const prevMonth = getMonthBounds(subMonths(now, 1));

      // Run all independent queries in parallel
      const [
        orcamentosCurrentRes,
        orcamentosPrevRes,
        recentOrcamentosRes,
        draftDataRes,
        historyDataRes,
      ] = await Promise.all([
        // 1. Fetch orcamentos from current month
        supabase
          .from("orcamentos")
          .select("id, numero, status, total, created_at, updated_at, cliente_snapshot, cliente_id")
          .gte("created_at", currentMonth.start.toISOString())
          .lte("created_at", currentMonth.end.toISOString())
          .order("updated_at", { ascending: false }),

        // 2. Fetch orcamentos from previous month
        supabase
          .from("orcamentos")
          .select("id, numero, status, total, created_at, updated_at, cliente_snapshot, cliente_id")
          .gte("created_at", prevMonth.start.toISOString())
          .lte("created_at", prevMonth.end.toISOString()),

        // 3. Fetch recent activities (last 5)
        supabase
          .from("orcamentos")
          .select("id, numero, status, updated_at, cliente_snapshot, cliente_id")
          .order("updated_at", { ascending: false })
          .limit(5),

        // 4. Fetch draft orcamento (most recent rascunho)
        supabase
          .from("orcamentos")
          .select("id, numero, cliente_snapshot, motor_snapshot, updated_at, cliente_id")
          .eq("status", "rascunho")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        // 5. Fetch history (all orcamentos for history table)
        supabase
          .from("orcamentos")
          .select("id, numero, status, total, created_at, cliente_snapshot, cliente_id")
          .order("created_at", { ascending: false }),
      ]);

      // Check for errors
      if (orcamentosCurrentRes.error) throw orcamentosCurrentRes.error;
      if (orcamentosPrevRes.error) throw orcamentosPrevRes.error;
      if (recentOrcamentosRes.error) throw recentOrcamentosRes.error;
      if (draftDataRes.error) throw draftDataRes.error;
      if (historyDataRes.error) throw historyDataRes.error;

      const orcamentosCurrent = orcamentosCurrentRes.data;
      const orcamentosPrev = orcamentosPrevRes.data;
      const recentOrcamentos = recentOrcamentosRes.data;
      const draftData = draftDataRes.data;
      const historyData = historyDataRes.data;

      // 4. Fetch itens_orcamento for service aggregation (depends on orcamentosCurrent)
      let itensCurrent: { servico_id: string | null; descricao: string; orcamento_id: string }[] = [];
      if (orcamentosCurrent && orcamentosCurrent.length > 0) {
        const { data: itensData, error: err5 } = await supabase
          .from("itens_orcamento")
          .select("servico_id, descricao, orcamento_id")
          .in("orcamento_id", orcamentosCurrent.map(o => o.id));
        if (err5) throw err5;
        itensCurrent = itensData || [];
      }

      // Get unique cliente_ids to fetch client names
      const clienteIds = new Set<string>();
      [...(recentOrcamentos || []), ...(historyData || []), draftData].forEach(o => {
        if (o?.cliente_id) clienteIds.add(o.cliente_id);
      });

      // Fetch client names
      let clientes: Record<string, string> = {};
      if (clienteIds.size > 0) {
        const { data: clientesData } = await supabase
          .from("clientes")
          .select("id, nome")
          .in("id", Array.from(clienteIds));
        clientes = Object.fromEntries((clientesData || []).map(c => [c.id, c.nome]));
      }

      // Helper to get client name
      const getClientName = (item: { cliente_id?: string | null; cliente_snapshot?: unknown } | null): string => {
        if (!item) return "Cliente não informado";
        if (item.cliente_id && clientes[item.cliente_id]) return clientes[item.cliente_id];
        if (item.cliente_snapshot && typeof item.cliente_snapshot === "object" && item.cliente_snapshot !== null) {
          const snapshot = item.cliente_snapshot as Record<string, unknown>;
          return (snapshot.nome as string) || (snapshot.empresa as string) || "Cliente não informado";
        }
        return "Cliente não informado";
      };

      // Calculate KPIs
      const currentCount = orcamentosCurrent?.length || 0;
      const prevCount = orcamentosPrev?.length || 0;
      const countVariation = prevCount > 0 ? ((currentCount - prevCount) / prevCount) * 100 : 0;

      const currentTotal = orcamentosCurrent?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const prevTotal = orcamentosPrev?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const totalVariation = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

      const currentAprovado = orcamentosCurrent?.filter(o => o.status === "aprovado").reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const prevAprovado = orcamentosPrev?.filter(o => o.status === "aprovado").reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const aprovadoVariation = prevAprovado > 0 ? ((currentAprovado - prevAprovado) / prevAprovado) * 100 : 0;

      // "Em Análise" considers only status "pendente" (rascunho is a draft still being created)
      const currentPendente = orcamentosCurrent?.filter(o => o.status === "pendente").reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const prevPendente = orcamentosPrev?.filter(o => o.status === "pendente").reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const pendenteVariation = prevPendente > 0 ? ((currentPendente - prevPendente) / prevPendente) * 100 : 0;

      const currentRejeitado = orcamentosCurrent?.filter(o => o.status === "recusado").reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const prevRejeitado = orcamentosPrev?.filter(o => o.status === "recusado").reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const rejeitadoVariation = prevRejeitado > 0 ? ((currentRejeitado - prevRejeitado) / prevRejeitado) * 100 : 0;

      const kpis: KPIData[] = [
        { label: "Orçamentos no Mês", value: currentCount, variation: Math.round(countVariation * 10) / 10, icon: "file-text", color: "primary" },
        { label: "Valor Total Orçado", value: currentTotal, variation: Math.round(totalVariation * 10) / 10, icon: "dollar-sign", color: "primary" },
        { label: "Aprovados", value: currentAprovado, variation: Math.round(aprovadoVariation * 10) / 10, icon: "check-circle", color: "success" },
        { label: "Em Análise", value: currentPendente, variation: Math.round(pendenteVariation * 10) / 10, icon: "clock", color: "warning" },
        { label: "Rejeitados", value: currentRejeitado, variation: Math.round(rejeitadoVariation * 10) / 10, icon: "x-circle", color: "destructive" },
      ];

      // Calculate chart data (daily aggregation)
      const daysInMonth = eachDayOfInterval({ start: currentMonth.start, end: currentMonth.end });
      const chartData: ChartDataPoint[] = daysInMonth.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayOrccamentos = orcamentosCurrent?.filter(o => {
          const createdDate = format(parseISO(o.created_at), "yyyy-MM-dd");
          return createdDate === dayStr;
        }) || [];
        const total = dayOrccamentos.length;
        const approved = dayOrccamentos.filter(o => o.status === "aprovado").length;
        return { day: day.getDate(), approved, total };
      });

      // Filter to show only days with data or up to today
      const today = now.getDate();
      const filteredChartData = chartData.filter(d => d.day <= today);

      // Calculate activities
      const activities: ActivityItem[] = (recentOrcamentos || []).map(o => ({
        id: o.id,
        numero: o.numero,
        cliente: getClientName(o),
        action: statusToAction(o.status),
        timeAgo: formatDistanceToNow(parseISO(o.updated_at), { addSuffix: true, locale: ptBR }),
      }));

      // Calculate top services
      const serviceCounts: Record<string, number> = {};
      (itensCurrent || []).forEach(item => {
        const name = item.descricao || "Serviço não informado";
        serviceCounts[name] = (serviceCounts[name] || 0) + 1;
      });
      const totalServices = Object.values(serviceCounts).reduce((sum, c) => sum + c, 0);
      const topServices: ServiceRank[] = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], idx) => ({
          rank: idx + 1,
          name,
          count,
          percentage: totalServices > 0 ? Math.round((count / totalServices) * 100) : 0,
        }));

      // Calculate financial summary
      const valorAprovado = currentAprovado;
      const valorEmAnalise = currentPendente;
      const valorRejeitado = currentRejeitado;
      const totalFinalizados = (orcamentosCurrent?.filter(o => o.status === "aprovado" || o.status === "recusado").length) || 0;
      const totalAprovadosCount = (orcamentosCurrent?.filter(o => o.status === "aprovado").length) || 0;
      const taxaAprovacao = totalFinalizados > 0 ? Math.round((totalAprovadosCount / totalFinalizados) * 100) : 0;

      const financial: FinancialSummary = {
        totalOrcado: currentTotal,
        valorAprovado,
        valorEmAnalise,
        valorRejeitado,
        taxaAprovacao,
      };

      // Calculate draft
      let draft: DraftOrcamento | null = null;
      if (draftData) {
        const motorInfo = draftData.motor_snapshot && typeof draftData.motor_snapshot === "object" && draftData.motor_snapshot !== null
          ? draftData.motor_snapshot as Record<string, unknown>
          : null;
        const motorStr = motorInfo
          ? `${motorInfo.marca || ""} ${motorInfo.modelo || ""} ${motorInfo.potencia || ""}`.trim() || "Motor não informado"
          : "Motor não informado";
        draft = {
          numero: draftData.numero,
          cliente: getClientName(draftData),
          motor: motorStr,
          progress: 50, // Default progress for drafts
          lastEdit: formatDistanceToNow(parseISO(draftData.updated_at), { addSuffix: true, locale: ptBR }),
        };
      }

      // Calculate history
      const history: OrcamentoHistory[] = (historyData || []).map(o => ({
        id: o.id,
        numero: o.numero,
        cliente: getClientName(o),
        data: format(parseISO(o.created_at), "yyyy-MM-dd"),
        valor: o.total || 0,
        status: mapHistoryStatus(o.status),
      }));

      return {
        kpis,
        chartData: filteredChartData,
        activities,
        topServices,
        financial,
        draft,
        history,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
