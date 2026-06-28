import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { brl, dateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOrcamentosHistory } from "@/hooks/useOrcamentosHistory";

const PAGE_SIZE = 10;

const statusStyles: Record<string, { label: string; class: string }> = {
  aprovado: { label: "Aprovado", class: "bg-success/15 text-success border-success/30" },
  pendente: { label: "Pendente", class: "bg-warning/15 text-warning border-warning/30" },
  cancelado: { label: "Cancelado", class: "bg-destructive/15 text-destructive border-destructive/30" },
  rascunho: { label: "Rascunho", class: "bg-muted/15 text-muted-foreground border-muted/30" },
};

export function HistoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "aprovado" | "pendente" | "cancelado" | "rascunho">("todos");
  const [periodFilter, setPeriodFilter] = useState<"este-mes" | "mes-anterior" | "ultimos-3">("este-mes");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, totalCount, totalPages, isLoading, error } = useOrcamentosHistory({
    search: debouncedSearch,
    status: statusFilter,
    periodo: periodFilter,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleStatusChange = useCallback((value: "todos" | "aprovado" | "pendente" | "cancelado" | "rascunho") => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handlePeriodChange = useCallback((value: "este-mes" | "mes-anterior" | "ultimos-3") => {
    setPeriodFilter(value);
    setCurrentPage(1);
  }, []);

  // Generate page numbers to display (show max 5 pages around current)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startItem = totalCount > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

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
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40 bg-input/40 border-border/40">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={handlePeriodChange}>
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                  Erro ao carregar dados
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum orçamento encontrado
                </td>
              </tr>
            ) : (
              data.map((item) => {
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
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          {totalCount > 0
            ? `Mostrando ${startItem}-${endItem} de ${totalCount} resultados`
            : "Nenhum resultado"}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-input/40 border-border/40"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {getPageNumbers().map((page) => (
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
              disabled={isLoading}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-input/40 border-border/40"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
