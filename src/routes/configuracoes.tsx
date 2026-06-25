import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({ component: ConfigPage });

const empty = { empresa_nome: "", empresa_cnpj: "", empresa_telefone: "", empresa_email: "", empresa_endereco: "", logo_url: "", rodape: "" };

function ConfigPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(empty);

  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: async () => (await supabase.from("configuracoes").select("*").limit(1).maybeSingle()).data,
  });

  useEffect(() => {
    if (data) setForm({ ...empty, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])) });
  }, [data]);

  async function save() {
    const payload: any = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]));
    const { error } = data?.id
      ? await supabase.from("configuracoes").update(payload).eq("id", data.id)
      : await supabase.from("configuracoes").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Configurações salvas");
    qc.invalidateQueries({ queryKey: ["config"] });
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Dados da empresa e personalização" actions={
        <Button onClick={save}><Save className="h-4 w-4 mr-2" /> Salvar</Button>
      } />

      <div className="px-6 py-6 lg:px-10 grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Dados da empresa</h2>
          <div><Label className="text-xs">Nome da empresa</Label><Input className="mt-1" value={form.empresa_nome} onChange={(e) => setForm({ ...form, empresa_nome: e.target.value })} /></div>
          <div><Label className="text-xs">CNPJ</Label><Input className="mt-1" value={form.empresa_cnpj} onChange={(e) => setForm({ ...form, empresa_cnpj: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">Telefone</Label><Input className="mt-1" value={form.empresa_telefone} onChange={(e) => setForm({ ...form, empresa_telefone: e.target.value })} /></div>
            <div><Label className="text-xs">E-mail</Label><Input type="email" className="mt-1" value={form.empresa_email} onChange={(e) => setForm({ ...form, empresa_email: e.target.value })} /></div>
          </div>
          <div><Label className="text-xs">Endereço</Label><Textarea className="mt-1" rows={2} value={form.empresa_endereco} onChange={(e) => setForm({ ...form, empresa_endereco: e.target.value })} /></div>
        </section>

        <section className="surface-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Identidade visual</h2>
          <div>
            <Label className="text-xs">URL do logotipo</Label>
            <Input className="mt-1" placeholder="https://…" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
            {form.logo_url && <img src={form.logo_url} alt="Logo" className="mt-3 max-h-24 rounded border border-border" />}
          </div>
          <div><Label className="text-xs">Rodapé do orçamento</Label><Textarea className="mt-1" rows={4} value={form.rodape} onChange={(e) => setForm({ ...form, rodape: e.target.value })} placeholder="Ex: Orçamento válido por 15 dias. Pagamento à vista ou em até 3x." /></div>
        </section>
      </div>
    </div>
  );
}
