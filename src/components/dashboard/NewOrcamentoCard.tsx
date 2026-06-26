import { useState } from "react";
import { Upload, Camera, FileText, Settings, Check, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Cliente", icon: FileText },
  { id: 2, label: "Motor", icon: Settings },
  { id: 3, label: "Serviços", icon: Wrench },
  { id: 4, label: "Resumo", icon: Check },
];

type InputMethod = "manual" | "photo";

export function NewOrcamentoCard() {
  const [currentStep, setCurrentStep] = useState(2);
  const [inputMethod, setInputMethod] = useState<InputMethod>("manual");

  return (
    <div className="surface-card p-6 h-full flex flex-col">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Novo Orçamento
      </h3>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-6 px-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full shrink-0 transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-success/20 text-success",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p
                  className={cn(
                    "text-xs mt-1.5 text-center whitespace-nowrap",
                    isActive && "text-primary font-medium",
                    !isActive && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mt-[-16px]",
                    isCompleted ? "bg-success/40" : "bg-border/40"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 space-y-4">
        {/* Cliente Section */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Dados do Cliente
          </p>
          <Button
            variant="outline"
            className="w-full justify-start bg-input/40 border-border hover:bg-secondary"
          >
            Selecionar cliente
          </Button>
        </div>

        {/* Motor Section */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Dados do Motor
          </p>
          <div className="flex gap-2">
            <Button
              variant={inputMethod === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMethod("manual")}
              className={cn(
                "flex-1",
                inputMethod === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-input/40 border-border"
              )}
            >
              Preenchimento manual
            </Button>
            <Button
              variant={inputMethod === "photo" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMethod("photo")}
              className={cn(
                "flex-1 gap-1",
                inputMethod === "photo"
                  ? "bg-primary text-primary-foreground"
                  : "bg-input/40 border-border"
              )}
              disabled
            >
              <Camera className="h-3.5 w-3.5" />
              Ler placa por foto
            </Button>
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Foto da Placa <span className="text-muted-foreground/60">(Opcional)</span>
          </p>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground mb-1">
                Clique ou arraste a foto da placa do motor
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG até 10MB
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/15 border border-warning/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                </span>
                <span className="text-[10px] font-medium text-warning uppercase tracking-wide">
                  EM BREVE
                </span>
                <span className="text-[10px] text-muted-foreground">Leitura automática via IA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-border/40">
        <Button variant="outline" className="flex-1 bg-input/40 border-border">
          Cancelar
        </Button>
        <Button className="flex-1 gap-2" style={{ background: "linear-gradient(135deg, #005CAB, #003366)" }}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
