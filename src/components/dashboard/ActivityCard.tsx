import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/mock-dashboard-data";

interface ActivityCardProps {
  activities: ActivityItem[];
}

const actionStyles: Record<ActivityItem["action"], { label: string; color: string }> = {
  editado: { label: "Editado", color: "text-muted-foreground" },
  aprovado: { label: "Aprovado", color: "text-success" },
  rejeitado: { label: "Rejeitado", color: "text-destructive" },
  criado: { label: "Criado", color: "text-primary" },
};

export function ActivityCard({ activities }: ActivityCardProps) {
  return (
    <div className="surface-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Atividades Recentes
        </h3>
        <Link
          to="/orcamentos"
          className="text-xs text-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const style = actionStyles[activity.action];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/15 shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  #{activity.numero} - {activity.cliente}
                </p>
                <p className={cn("text-xs mt-0.5", style.color)}>
                  {style.label} {activity.timeAgo}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
