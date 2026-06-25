import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/orcamentos/novo")({
  component: NovoOrcamento,
});

type Cliente = { id: string; nome: string; empresa: string | null; telefone: string | null; email: string | null };
type Servico = { id: string; descricao: string; preco_padrao: number };
type Item = { descricao: string; quantidade: number; valor_unitario: number; servico_id?: string | null };

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary text-sm font-semibold">{step}</div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NovoOrcamento() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Cliente
  const [clienteId, setClienteId] = useState<string>("novo");
  const [cliente, setCliente] = useState({ nome: "", empresa: "", telefone: "", email: "" });
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("*").order("nome");
      return (data ?? []) as Cliente[];
    },
  });

  useEffect(() => {
    if (clienteId !== "novo") {
      const c = clientes.find((x) => x.id === clienteId);
      if (c) setCliente({ nome: c.nome, empresa: c.empresa ?? "", telefone: c.telefone ?? "", email: c.email ?? "" });
    } else {
      setCliente({ nome: "", empresa: "", telefone: "", email: "" });
    }
  }, [clienteId, clientes]);

  // Motor
  const [motor, setMotor] = useState({ marca: "", modelo: "", potencia: "", tensao: "", rpm: "", polos: "", frequencia: "", observacoes: "" });

  // Serviços
  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos-ativos"],
    queryFn: async () => {
      const { data } = await supabase.from("servicos").select("*").eq("ativo", true).order("descricao");
      return (data ?? []) as Servico[];
    },
  });
  const [itens, setItens] = useState<Item[]>([]);
  const addItem = (s?: Servico) =>
    setItens((prev) => [
      ...prev,
      s ? { descricao: s.descricao, quantidade: 1, valor_unitario: Number(s.preco_padrao), servico_id: s.id } : { descricao: "", quantidade: 1, valor_unitario: 0 },
    ]);
  const updateItem = (i: number, patch: Partial<Item>) => setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i: number) => setItens((prev) => prev.filter((_, idx) => idx !== i));

  // Financeiro
  const [desconto, setDesconto] = useState<number>(0);
  const [observacoes, setObservacoes] = useState("");

  const subtotal = useMemo(() => itens.reduce((s, it) => s + Number(it.quantidade || 0) * Number(it.valor_unitario || 0), 0), [itens]);
  const total = Math.max(0, subtotal - Number(desconto || 0));

  const [saving, setSaving] = useState(false);

  async function salvar(status: "rascunho" | "pendente") {
    if (!cliente.nome.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (itens.length === 0) {
      toast.error("Adicione ao menos um serviço.");
      return;
    }
    setSaving(true);
    try {
      let finalClienteId = clienteId !== "novo" ? clienteId : null;
      if (clienteId === "novo") {
        const { data, error } = await supabase
          .from("clientes")
          .insert({ nome: cliente.nome, empresa: cliente.empresa || null, telefone: cliente.telefone || null, email: cliente.email || null })
          .select()
          .single();
        if (error) throw error;
        finalClienteId = data.id;
      }

      // Motor opcional
      let finalMotorId: string | null = null;
      const motorHasData = Object.values(motor).some((v) => v && String(v).trim() !== "");
      if (motorHasData) {
        const { data, error } = await supabase
          .from("motores")
          .insert({ ...motor, cliente_id: finalClienteId })
          .select()
          .single();
        if (error) throw error;
        finalMotorId = data.id;
      }

      const { data: orc, error: orcErr } = await supabase
        .from("orcamentos")
        .insert({
          cliente_id: finalClienteId,
          motor_id: finalMotorId,
          cliente_snapshot: cliente,
          motor_snapshot: motor,
          subtotal,
          desconto: Number(desconto || 0),
          total,
          status,
          observacoes: observacoes || null,
        })
        .select()
        .single();
      if (orcErr) throw orcErr;

      const itensPayload = itens.map((it, idx) => ({
        orcamento_id: orc.id,
        servico_id: it.servico_id ?? null,
        descricao: it.descricao,
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
        valor_total: Number(it.quantidade) * Number(it.valor_unitario),
        ordem: idx,
      }));
      const { error: itensErr } = await supabase.from("itens_orcamento").insert(itensPayload);
      if (itensErr) throw itensErr;

      toast.success(`Orçamento #${orc.numero} salvo!`);
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      navigate({ to: "/orcamentos" });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Novo Orçamento"
        subtitle="Preencha as seções abaixo. Você pode salvar como rascunho a qualquer momento."
        actions={
          <Button variant="ghost" asChild>
            <Link to="/orcamentos"><X className="h-4 w-4 mr-2" /> Cancelar</Link>
          </Button>
        }
      />

      <div className="px-6 py-6 lg:px-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          {/* 1. Cliente */}
          <Section step={1} title="Cliente">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Selecionar cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger className="bg-input/40 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">+ Novo cliente</SelectItem>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}{c.empresa ? ` — ${c.empresa}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Nome *</Label><Input className="mt-1 bg-input/40" value={cliente.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} /></div>
                <div><Label className="text-xs">Empresa</Label><Input className="mt-1 bg-input/40" value={cliente.empresa} onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })} /></div>
                <div><Label className="text-xs">Telefone</Label><Input className="mt-1 bg-input/40" value={cliente.telefone} onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })} /></div>
                <div><Label className="text-xs">E-mail</Label><Input type="email" className="mt-1 bg-input/40" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} /></div>
              </div>
            </div>
          </Section>

          {/* 2. Motor */}
          <Section step={2} title="Motor">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Preencha manualmente ou use a foto da placa.</p>
              <Button type="button" variant="outline" size="sm" disabled title="Em breve">
                <Camera className="h-4 w-4 mr-2" /> Ler placa do motor
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ["marca", "Marca"], ["modelo", "Modelo"], ["potencia", "Potência (CV/kW)"],
                ["tensao", "Tensão (V)"], ["rpm", "RPM"], ["polos", "Nº de polos"],
                ["frequencia", "Frequência (Hz)"],
              ].map(([k, l]) => (
                <div key={k}>
                  <Label className="text-xs">{l}</Label>
                  <Input className="mt-1 bg-input/40" value={(motor as any)[k]} onChange={(e) => setMotor({ ...motor, [k]: e.target.value })} />
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3">
                <Label className="text-xs">Observações</Label>
                <Textarea className="mt-1 bg-input/40" rows={2} value={motor.observacoes} onChange={(e) => setMotor({ ...motor, observacoes: e.target.value })} />
              </div>
            </div>
          </Section>

          {/* 3. Serviços */}
          <Section step={3} title="Serviços">
            <div className="mb-3 flex flex-wrap gap-2">
              {servicos.map((s) => (
                <button key={s.id} type="button" onClick={() => addItem(s)} className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs hover:border-primary hover:text-primary transition">
                  + {s.descricao}
                </button>
              ))}
              <button type="button" onClick={() => addItem()} className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                + Item livre
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="pb-2 pr-2">Descrição</th>
                    <th className="pb-2 px-2 w-20">Qtd</th>
                    <th className="pb-2 px-2 w-32">Unitário</th>
                    <th className="pb-2 px-2 w-32 text-right">Total</th>
                    <th className="pb-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {itens.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">Nenhum serviço adicionado.</td></tr>
                  )}
                  {itens.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-2"><Input value={it.descricao} onChange={(e) => updateItem(i, { descricao: e.target.value })} className="bg-input/40" /></td>
                      <td className="py-2 px-2"><Input type="number" min="0" step="0.01" value={it.quantidade} onChange={(e) => updateItem(i, { quantidade: Number(e.target.value) })} className="bg-input/40" /></td>
                      <td className="py-2 px-2"><Input type="number" min="0" step="0.01" value={it.valor_unitario} onChange={(e) => updateItem(i, { valor_unitario: Number(e.target.value) })} className="bg-input/40" /></td>
                      <td className="py-2 px-2 text-right font-medium">{brl(it.quantidade * it.valor_unitario)}</td>
                      <td className="py-2 text-right"><button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => addItem()} className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="h-3 w-3" /> Adicionar item
            </button>
          </Section>

          {/* 5. Observações */}
          <Section step={5} title="Observações">
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={4} className="bg-input/40" placeholder="Informações adicionais, condições de pagamento, prazos…" />
          </Section>
        </div>

        {/* Resumo financeiro sticky */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="surface-card p-6 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Resumo</div>
              <h2 className="font-display text-lg font-semibold mt-1">Financeiro</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{brl(subtotal)}</span></div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-muted-foreground">Desconto</span>
                <Input type="number" min="0" step="0.01" value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} className="bg-input/40 w-32 text-right" />
              </div>
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between items-baseline">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl font-semibold text-primary">{brl(total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button onClick={() => salvar("pendente")} disabled={saving} className="w-full" style={{ background: "var(--gradient-primary)" }}>
                <Save className="h-4 w-4 mr-2" /> Salvar orçamento
              </Button>
              <Button onClick={() => salvar("rascunho")} disabled={saving} variant="outline" className="w-full">
                Salvar como rascunho
              </Button>
              <Button disabled variant="ghost" className="w-full" title="Em breve">
                Gerar PDF
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
