import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Users, Plus, Clock, CheckCircle2, Zap } from "lucide-react";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

async function loadStats() {
  const startMonth = new Date();
  startMonth.setDate(1);
  startMonth.setHours(0, 0, 0, 0);

  const [orcMes, aprovados, pendentes, clientes] = await Promise.all([
    supabase.from("orcamentos").select("id,total,status,created_at").gte("created_at", startMonth.toISOString()),
    supabase.from("orcamentos").select("id,total", { count: "exact" }).eq("status", "aprovado").gte("created_at", startMonth.toISOString()),
    supabase.from("orcamentos").select("id,total", { count: "exact" }).eq("status", "pendente"),
    supabase.from("clientes").select("id", { count: "exact", head: true }),
  ]);
  const totalMes = (orcMes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
  const totalAprovado = (aprovados.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
  const totalPendente = (pendentes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
  return {
    countMes: orcMes.data?.length ?? 0,
    totalMes,
    countAprovado: aprovados.data?.length ?? 0,
    totalAprovado,
    countPendente: pendentes.data?.length ?? 0,
    totalPendente,
    countClientes: clientes.count ?? 0,
  };
}

function Stat({ icon: Icon, label, value, hint, accent }: { icon: any; label: string; value: string; hint?: string; accent?: string }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${accent ?? "bg-accent"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}


function Dashboard() {
  const { data } = useSuspenseQuery({ queryKey: ["dashboard-stats"], queryFn: loadStats });

  return (
    <div>
      <header className="border-b border-border bg-surface/40 px-6 py-8 lg:px-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Painel</div>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Bom trabalho 👋</h1>
          </div>
          <Link
            to="/orcamentos/novo"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Zap className="h-4 w-4" />
            Novo Orçamento
          </Link>
        </div>
      </header>

      <div className="px-6 py-8 lg:px-10 space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={FileText} label="Orçamentos no mês" value={String(data.countMes)} hint={brl(data.totalMes)} />
          <Stat icon={CheckCircle2} label="Aprovado (mês)" value={brl(data.totalAprovado)} hint={`${data.countAprovado} orçamentos`} accent="bg-success/15 text-success" />
          <Stat icon={Clock} label="Pendente" value={brl(data.totalPendente)} hint={`${data.countPendente} aguardando`} accent="bg-warning/15 text-warning" />
          <Stat icon={Users} label="Clientes" value={String(data.countClientes)} hint="Cadastrados" />
        </section>
      </div>
    </div>
  );
}
