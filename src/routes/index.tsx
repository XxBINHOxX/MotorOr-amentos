import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Zap, Loader as Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  StatCard,
  DraftOrcamentoCard,
  ChartCard,
  ActivityCard,
  ServicesCard,
  FinancialCard,
  NewOrcamentoCard,
  HistoryTable,
} from "@/components/dashboard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/lib/auth-context";

// Keep mock imports as reference (commented)
// import { draftOrcamento as mockDraft } from "@/lib/mock-dashboard-data";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { user } = useAuth();

  const userName = user?.email?.split("@")[0] || "Usuário";
  const capitalizedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-destructive font-medium">Erro ao carregar dados do dashboard</p>
          <p className="text-sm text-muted-foreground mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  // Default values if no data
  const kpis = stats?.kpis || [
    { label: "Orçamentos no Mês", value: 0, variation: 0, icon: "file-text", color: "primary" },
    { label: "Valor Total Orçado", value: 0, variation: 0, icon: "dollar-sign", color: "primary" },
    { label: "Aprovados", value: 0, variation: 0, icon: "check-circle", color: "success" },
    { label: "Em Análise", value: 0, variation: 0, icon: "clock", color: "warning" },
    { label: "Rejeitados", value: 0, variation: 0, icon: "x-circle", color: "destructive" },
  ];
  const chartData = stats?.chartData || [{ day: 1, approved: 0, total: 0 }];
  const activities = stats?.activities || [];
  const topServices = stats?.topServices || [];
  const financial = stats?.financial || {
    totalOrcado: 0,
    valorAprovado: 0,
    valorEmAnalise: 0,
    valorRejeitado: 0,
    taxaAprovacao: 0,
  };
  const draft = stats?.draft;
  const history = stats?.history || [];

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Header */}
      <header className="border-b border-border bg-surface/40 px-6 py-6 lg:px-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                {greeting()}, {capitalizedUserName}!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Aqui está o resumo da sua operação hoje.
              </p>
            </div>
            <Link
              to="/orcamentos/novo"
              className="hidden lg:inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #005CAB, #003366)" }}
            >
              <Zap className="h-4 w-4" />
              Novo Orçamento
            </Link>
          </div>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, orçamento, motor, serviço..."
              className="pl-9 pr-20 bg-input/40 border-border/40 h-11"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-surface-elevated px-2 py-1 rounded border border-border/40">
              <kbd className="font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="font-mono">K</kbd>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {/* KPI Row - 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, idx) => (
            <StatCard
              key={idx}
              label={kpi.label}
              value={kpi.value}
              variation={kpi.variation}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Second Row - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:[&>*:first-child]:w-full lg:[&>*:first-child]:max-w-[320px]">
          {draft ? (
            <DraftOrcamentoCard data={draft} />
          ) : (
            <div className="surface-card p-6 flex flex-col items-center justify-center h-full text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum orçamento em rascunho
              </p>
              <Link
                to="/orcamentos/novo"
                className="mt-4 text-sm text-primary hover:underline"
              >
                Criar novo orçamento
              </Link>
            </div>
          )}
          <ChartCard data={chartData} />
          <ActivityCard activities={activities} />
        </div>

        {/* Third Row - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ServicesCard services={topServices} />
          <FinancialCard data={financial} />
          <NewOrcamentoCard />
        </div>

        {/* History Table */}
        <HistoryTable />
      </div>
    </div>
  );
}

// Import for the empty state icon
import { FileText } from "lucide-react";
