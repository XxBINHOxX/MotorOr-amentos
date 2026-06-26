import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import type { FinancialSummary } from "@/lib/mock-dashboard-data";

interface FinancialCardProps {
  data: FinancialSummary;
}

export function FinancialCard({ data }: FinancialCardProps) {
  return (
    <div className="surface-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Resumo Financeiro
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs bg-input/40 border-border/40 hover:bg-secondary"
        >
          Este mês
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <span className="text-sm text-muted-foreground">Valor total orçado</span>
          <span className="text-sm font-semibold text-foreground">
            {brl(data.totalOrcado)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <span className="text-sm text-muted-foreground">Valor aprovado</span>
          <span className="text-sm font-semibold text-success">
            {brl(data.valorAprovado)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <span className="text-sm text-muted-foreground">Valor em análise</span>
          <span className="text-sm font-semibold text-warning">
            {brl(data.valorEmAnalise)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <span className="text-sm text-muted-foreground">Valor rejeitado</span>
          <span className="text-sm font-semibold text-destructive">
            {brl(data.valorRejeitado)}
          </span>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-success/15 border border-success/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-success font-medium">Taxa de aprovação</span>
          <span className="text-2xl font-bold text-success">{data.taxaAprovacao}%</span>
        </div>
      </div>
    </div>
  );
}
