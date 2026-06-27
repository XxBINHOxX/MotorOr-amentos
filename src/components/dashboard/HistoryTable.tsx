import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { brl, dateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrcamentoHistory } from "@/hooks/useDashboardStats";

interface HistoryTableProps {
  data: OrcamentoHistory[];
}

const statusStyles: Record<OrcamentoHistory["status"], { label: string; class: string }> = {
  aprovado: { label: "Aprovado", class: "bg-success/15 text-success border-success/30" },
  pendente: { label: "Pendente", class: "bg-warning/15 text-warning border-warning/30" },
  cancelado: { label: "Cancelado", class: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function HistoryTable({ data }: HistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className="surface-card overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Histórico de Orçamentos
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 bg-input/40 border-border/40"
            />
          </div>
          <Select defaultValue="todos">
            <SelectTrigger className="w-40 bg-input/40 border-border/40">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="este-mes">
            <SelectTrigger className="w-36 bg-input/40 border-border/40">
              <SelectValue placeholder="Este mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="este-mes">Este mês</SelectItem>
              <SelectItem value="mes-anterior">Mês anterior</SelectItem>
              <SelectItem value="ultimos-3">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nº Orçamento</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.map((item) => {
              const status = statusStyles[item.status];
              return (
                <tr key={item.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    #{item.numero}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium truncate max-w-[200px]">
                    {item.cliente}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dateBR(item.data)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {brl(item.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      status.class
                    )}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to="/orcamentos/$id"
                      params={{ id: item.id }}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          Mostrando {data.length} de {data.length} resultados
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-input/40 border-border/40"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8",
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-input/40 border-border/40"
              )}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-input/40 border-border/40"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
