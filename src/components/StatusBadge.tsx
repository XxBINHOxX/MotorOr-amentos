import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground border-border",
  pendente: "bg-warning/15 text-warning border-warning/30",
  aprovado: "bg-success/15 text-success border-success/30",
  recusado: "bg-destructive/15 text-destructive border-destructive/30",
};

const label: Record<string, string> = {
  rascunho: "Rascunho",
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", map[status] ?? map.rascunho)}>
      {label[status] ?? status}
    </span>
  );
}
