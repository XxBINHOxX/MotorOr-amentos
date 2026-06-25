import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { brl, dateBR } from "@/lib/format";

export const Route = createFileRoute("/orcamentos/")({
  component: OrcamentosList,
});

function OrcamentosList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("todos");

  const { data = [] } = useQuery({
    queryKey: ["orcamentos", q, status],
    queryFn: async () => {
      let query = supabase
        .from("orcamentos")
        .select("id, numero, total, status, created_at, cliente_snapshot, cliente:clientes(nome,empresa)")
        .order("created_at", { ascending: false });
      if (status !== "todos") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      const items = data ?? [];
      if (!q) return items;
      const needle = q.toLowerCase();
      return items.filter((o: any) => {
        const nome = o.cliente?.nome ?? o.cliente_snapshot?.nome ?? "";
        return (
          String(o.numero).includes(needle) ||
          nome.toLowerCase().includes(needle)
        );
      });
    },
  });

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        subtitle="Histórico completo de orçamentos emitidos"
        actions={
          <Button asChild>
            <Link to="/orcamentos/novo"><Plus className="h-4 w-4 mr-2" /> Novo</Link>
          </Button>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-4">
        <div className="surface-card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nº ou cliente…" className="pl-9 bg-input/40" />
          </div>
          <div className="flex gap-1 rounded-lg bg-input/40 p-1">
            {["todos", "pendente", "aprovado", "recusado", "rascunho"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhum orçamento encontrado.</td></tr>
              )}
              {data.map((o: any) => {
                const nome = o.cliente?.nome ?? o.cliente_snapshot?.nome ?? "—";
                const empresa = o.cliente?.empresa ?? o.cliente_snapshot?.empresa;
                return (
                  <tr key={o.id} className="hover:bg-surface-elevated/40">
                    <td className="px-4 py-3 font-mono text-xs">#{o.numero}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{nome}</div>
                      {empresa && <div className="text-xs text-muted-foreground">{empresa}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{dateBR(o.created_at)}</td>
                    <td className="px-4 py-3 text-right font-medium">{brl(o.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/orcamentos/$id" params={{ id: o.id }} className="text-xs text-primary hover:underline">Abrir</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
