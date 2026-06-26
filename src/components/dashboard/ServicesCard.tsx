import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ServiceRank } from "@/lib/mock-dashboard-data";

interface ServicesCardProps {
  services: ServiceRank[];
}

export function ServicesCard({ services }: ServicesCardProps) {
  return (
    <div className="surface-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Serviços Mais Solicitados
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

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.rank} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/15 text-primary text-sm font-bold">
                  {service.rank}
                </span>
                <span className="text-sm text-foreground font-medium">
                  {service.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{service.count} serviços</span>
                <span className="text-primary font-medium">{service.percentage}%</span>
              </div>
            </div>
            <Progress
              value={service.percentage}
              className="h-2 bg-surface-elevated"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
