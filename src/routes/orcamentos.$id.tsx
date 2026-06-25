import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brl, dateBR } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orcamentos/$id")({
  component: OrcamentoDetalhe,
});

function OrcamentoDetalhe() {
  const { id } = Route.useParams();
  const router = useRouter();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["orcamento", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*, cliente:clientes(*), motor:motores(*), itens:itens_orcamento(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  if (isLoading || !data) return <div className="p-10 text-muted-foreground">Carregando…</div>;

  const cliente = data.cliente ?? data.cliente_snapshot ?? {};
  const motor = data.motor ?? data.motor_snapshot ?? {};
  const itens = (data.itens ?? []).sort((a: any, b: any) => a.ordem - b.ordem);

  async function changeStatus(status: string) {
    const { error } = await supabase.from("orcamentos").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado");
    refetch();
  }

  return (
    <div>
      <PageHeader
        title={`Orçamento #${data.numero}`}
        subtitle={`Criado em ${dateBR(data.created_at)}`}
        actions={
          <>
            <Button variant="ghost" asChild><Link to="/orcamentos"><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Link></Button>
            <Select value={data.status} onValueChange={changeStatus}>
              <SelectTrigger className="w-40 bg-input/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="recusado">Recusado</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
      <div className="px-6 py-6 lg:px-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 min-w-0">
          <div className="surface-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Cliente</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Nome</div><div>{cliente.nome ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Empresa</div><div>{cliente.empresa ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Telefone</div><div>{cliente.telefone ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">E-mail</div><div>{cliente.email ?? "—"}</div></div>
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Motor</h2>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              {[
                ["Marca", motor.marca], ["Modelo", motor.modelo], ["Potência", motor.potencia],
                ["Tensão", motor.tensao], ["RPM", motor.rpm], ["Polos", motor.polos], ["Frequência", motor.frequencia],
              ].map(([l, v]) => (
                <div key={l as string}><div className="text-xs text-muted-foreground">{l}</div><div>{v ?? "—"}</div></div>
              ))}
            </div>
            {motor.observacoes && <div className="mt-3 text-sm"><div className="text-xs text-muted-foreground">Observações</div>{motor.observacoes}</div>}
          </div>

          <div className="surface-card overflow-hidden">
            <div className="p-6 pb-3"><h2 className="font-display text-lg font-semibold">Serviços</h2></div>
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-2">Descrição</th><th className="px-4 py-2 w-20 text-right">Qtd</th><th className="px-4 py-2 w-32 text-right">Unit.</th><th className="px-4 py-2 w-32 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itens.map((it: any) => (
                  <tr key={it.id}>
                    <td className="px-4 py-2">{it.descricao}</td>
                    <td className="px-4 py-2 text-right">{it.quantidade}</td>
                    <td className="px-4 py-2 text-right">{brl(it.valor_unitario)}</td>
                    <td className="px-4 py-2 text-right font-medium">{brl(it.valor_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.observacoes && (
            <div className="surface-card p-6">
              <h2 className="font-display text-lg font-semibold mb-2">Observações</h2>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{data.observacoes}</p>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="surface-card p-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={data.status} /></div>
            <div className="border-t border-border" />
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{brl(data.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span>− {brl(data.desconto)}</span></div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-baseline">
              <span className="font-medium">Total</span>
              <span className="font-display text-2xl font-semibold text-primary">{brl(data.total)}</span>
            </div>
            <Button disabled className="w-full mt-3" title="Em breve">Gerar PDF</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
