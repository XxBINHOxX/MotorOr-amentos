import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChartDataPoint } from "@/lib/mock-dashboard-data";

interface ChartCardProps {
  data: ChartDataPoint[];
}

export function ChartCard({ data }: ChartCardProps) {
  return (
    <div className="surface-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Evolução de Orçamentos
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

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="day"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => String(value).padStart(2, "0")}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#16213A",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#E2E8F0",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94A3B8" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#005CAB"
              strokeWidth={2}
              dot={{ fill: "#005CAB", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#005CAB" }}
            />
            <Line
              type="monotone"
              dataKey="approved"
              name="Aprovados"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ fill: "#22C55E", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#22C55E" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Aprovados</span>
        </div>
      </div>
    </div>
  );
}
