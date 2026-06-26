import { Link } from "@tanstack/react-router";
import { FileText, Settings, Wrench, Check, ArrowRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Cliente", icon: FileText },
  { id: 2, label: "Motor", icon: Settings },
  { id: 3, label: "Serviços", icon: Wrench },
  { id: 4, label: "Resumo", icon: Check },
];

export function NewOrcamentoCard() {
  return (
    <Link
      to="/orcamentos/novo"
      className="surface-card p-6 h-full flex flex-col cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_0_1px_rgba(0,92,171,0.3)] group"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Novo Orçamento
      </h3>

      {/* Stepper - statically showing step 1 as starting point */}
      <div className="flex items-center justify-between mb-6 px-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isStart = step.id === 1;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full shrink-0 transition-colors",
                    isStart
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p
                  className={cn(
                    "text-xs mt-1.5 text-center whitespace-nowrap",
                    isStart ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 mt-[-16px] bg-border/40" />
              )}
            </div>
          );
        })}
      </div>

      {/* Preview sections - decorative illustrations of what the wizard will ask */}
      <div className="flex-1 space-y-3 pointer-events-none">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Passo 1: Dados do Cliente
          </p>
          <p className="text-xs text-muted-foreground/70">
            Selecione um cliente existente ou cadastre um novo
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Passo 2: Dados do Motor
          </p>
          <p className="text-xs text-muted-foreground/70">
            Informe marca, modelo, potência ou leia a placa por foto
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Passo 3: Serviços
          </p>
          <p className="text-xs text-muted-foreground/70">
            Adicione serviços do catálogo ou crie itens personalizados
          </p>
        </div>

        {/* Decorative upload preview */}
        <div className="mt-4 opacity-40">
          <div className="border-2 border-dashed border-border rounded-lg py-4 text-center">
            <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">
              Foto da placa (opcional)
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-4 pt-4 border-t border-border/40">
        <div
          className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #005CAB, #003366)" }}
        >
          Iniciar Orçamento
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
