// Mock data for Dashboard - Industrial motor maintenance context

export interface KPIData {
  label: string;
  value: string | number;
  variation: number;
  icon: string;
  color: string;
}

export const kpiData: KPIData[] = [
  { label: "Orçamentos no Mês", value: 24, variation: 12, icon: "file-text", color: "primary" },
  { label: "Valor Total Orçado", value: 187500, variation: 8.5, icon: "dollar-sign", color: "primary" },
  { label: "Aprovados", value: 114800, variation: 15.2, icon: "check-circle", color: "success" },
  { label: "Em Análise", value: 48000, variation: -5.3, icon: "clock", color: "warning" },
  { label: "Rejeitados", value: 24700, variation: -8.1, icon: "x-circle", color: "destructive" },
];

export interface ChartDataPoint {
  day: number;
  approved: number;
  total: number;
}

export const chartData: ChartDataPoint[] = [
  { day: 1, approved: 2, total: 4 },
  { day: 5, approved: 3, total: 6 },
  { day: 10, approved: 5, total: 8 },
  { day: 15, approved: 4, total: 7 },
  { day: 20, approved: 6, total: 9 },
  { day: 25, approved: 4, total: 5 },
  { day: 30, approved: 5, total: 7 },
];

export interface ActivityItem {
  id: string;
  numero: number;
  cliente: string;
  action: "editado" | "aprovado" | "rejeitado" | "criado";
  timeAgo: string;
}

export const recentActivities: ActivityItem[] = [
  { id: "1", numero: 245, cliente: "Metalúrgica Alfa Ltda", action: "editado", timeAgo: "há 25 min" },
  { id: "2", numero: 244, cliente: "Ind. ABC S/A", action: "aprovado", timeAgo: "há 2 horas" },
  { id: "3", numero: 243, cliente: "Beneficiadora XYZ", action: "rejeitado", timeAgo: "há 1 dia" },
  { id: "4", numero: 242, cliente: "Usina Norte", action: "aprovado", timeAgo: "há 2 dias" },
  { id: "5", numero: 241, cliente: "Laticínios Beta", action: "criado", timeAgo: "há 3 dias" },
];

export interface ServiceRank {
  rank: number;
  name: string;
  count: number;
  percentage: number;
}

export const topServices: ServiceRank[] = [
  { rank: 1, name: "Rebobinamento", count: 14, percentage: 32 },
  { rank: 2, name: "Troca de Rolamentos", count: 11, percentage: 25 },
  { rank: 3, name: "Pintura", count: 8, percentage: 18 },
  { rank: 4, name: "Revisão Completa", count: 6, percentage: 14 },
  { rank: 5, name: "Balanceamento", count: 5, percentage: 11 },
];

export interface FinancialSummary {
  totalOrcado: number;
  valorAprovado: number;
  valorEmAnalise: number;
  valorRejeitado: number;
  taxaAprovacao: number;
}

export const financialSummary: FinancialSummary = {
  totalOrcado: 187500,
  valorAprovado: 114800,
  valorEmAnalise: 48000,
  valorRejeitado: 24700,
  taxaAprovacao: 61,
};

export interface DraftOrcamento {
  numero: number;
  cliente: string;
  motor: string;
  progress: number;
  lastEdit: string;
}

export const draftOrcamento: DraftOrcamento = {
  numero: 245,
  cliente: "Metalúrgica Alfa Ltda",
  motor: "WEG 20 CV - 4 Polos - 1750 RPM",
  progress: 70,
  lastEdit: "há 25 min",
};

export interface OrcamentoHistory {
  id: string;
  numero: number;
  cliente: string;
  data: string;
  valor: number;
  status: "aprovado" | "pendente" | "cancelado";
}

export const orcamentoHistory: OrcamentoHistory[] = [
  { id: "1", numero: 245, cliente: "Metalúrgica Alfa Ltda", data: "2024-01-15", valor: 12450, status: "pendente" },
  { id: "2", numero: 244, cliente: "Ind. ABC S/A", data: "2024-01-15", valor: 8920, status: "aprovado" },
  { id: "3", numero: 243, cliente: "Beneficiadora XYZ", data: "2024-01-14", valor: 15300, status: "cancelado" },
  { id: "4", numero: 242, cliente: "Usina Norte", data: "2024-01-14", valor: 22500, status: "aprovado" },
  { id: "5", numero: 241, cliente: "Laticínios Beta", data: "2024-01-13", valor: 6780, status: "aprovado" },
  { id: "6", numero: 240, cliente: "Fábrica Delta", data: "2024-01-13", valor: 18900, status: "pendente" },
];

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};
