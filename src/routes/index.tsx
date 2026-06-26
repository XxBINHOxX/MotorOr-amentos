import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Zap } from "lucide-react";
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
import {
  kpiData,
  chartData,
  recentActivities,
  topServices,
  financialSummary,
  draftOrcamento,
  orcamentoHistory,
  greeting,
} from "@/lib/mock-dashboard-data";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Header */}
      <header className="border-b border-border bg-surface/40 px-6 py-6 lg:px-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                {greeting()}, João! 👋
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
          {kpiData.map((kpi, idx) => (
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
          <DraftOrcamentoCard data={draftOrcamento} />
          <ChartCard data={chartData} />
          <ActivityCard activities={recentActivities} />
        </div>

        {/* Third Row - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ServicesCard services={topServices} />
          <FinancialCard data={financialSummary} />
          <NewOrcamentoCard />
        </div>

        {/* History Table */}
        <HistoryTable data={orcamentoHistory} />
      </div>
    </div>
  );
}
