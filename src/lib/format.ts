export const brl = (value: number | string | null | undefined) => {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const dateBR = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("pt-BR");
};

export const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
};
