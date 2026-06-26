import { FileText, DollarSign, CheckCircle, Clock, XCircle, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "file-text": FileText,
  "dollar-sign": DollarSign,
  "check-circle": CheckCircle,
  "clock": Clock,
  "x-circle": XCircle,
};

const colorClasses: Record<string, { bg: string; icon: string }> = {
  primary: { bg: "bg-primary/15", icon: "text-primary" },
  success: { bg: "bg-success/15", icon: "text-success" },
  warning: { bg: "bg-warning/15", icon: "text-warning" },
  destructive: { bg: "bg-destructive/15", icon: "text-destructive" },
};

interface StatCardProps {
  label: string;
  value: string | number;
  variation: number;
  icon: string;
  color: string;
}

export function StatCard({ label, value, variation, icon, color }: StatCardProps) {
  const Icon = iconMap[icon] || FileText;
  const colorStyle = colorClasses[color] || colorClasses.primary;
  const isPositive = variation >= 0;
  const formattedValue = typeof value === "number" && value > 999
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
    : value;

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </p>
          <p className="font-display text-2xl font-bold mt-2 text-foreground">
            {formattedValue}
          </p>
          <div className={cn(
            "flex items-center gap-1 mt-2 text-sm font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{isPositive ? "+" : ""}{variation}%</span>
            <span className="text-muted-foreground font-normal">vs mês anterior</span>
          </div>
        </div>
        <div className={cn(
          "flex items-center justify-center h-12 w-12 rounded-xl shrink-0 ml-3",
          colorStyle.bg
        )}>
          <Icon className={cn("h-6 w-6", colorStyle.icon)} />
        </div>
      </div>
    </div>
  );
}
