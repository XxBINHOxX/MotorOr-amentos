import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DraftOrcamento } from "@/lib/mock-dashboard-data";

interface DraftOrcamentoCardProps {
  data: DraftOrcamento;
}

export function DraftOrcamentoCard({ data }: DraftOrcamentoCardProps) {
  return (
    <div className="surface-card p-6 flex flex-col h-full">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Continuar Orçamento
      </h3>

      <div className="flex-1 space-y-4">
        <div>
          <p className="text-2xl font-bold text-primary">
            #{data.numero}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {data.cliente}
          </p>
        </div>

        <div className="bg-surface-elevated rounded-lg p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Motor
          </p>
          <p className="text-sm text-foreground">{data.motor}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Progresso
            </p>
            <p className="text-sm font-medium text-foreground">{data.progress}%</p>
          </div>
          <Progress value={data.progress} className="h-2" />
        </div>

        <p className="text-xs text-muted-foreground">
          Última edição: {data.lastEdit}
        </p>
      </div>

      <Button className="w-full mt-4 gap-2" style={{ background: "linear-gradient(135deg, #005CAB, #003366)" }}>
        Continuar Orçamento
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
