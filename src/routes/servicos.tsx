import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/servicos")({ component: ServicosPage });

type Servico = { id: string; descricao: string; preco_padrao: number; ativo: boolean };
const empty = { descricao: "", preco_padrao: 0, ativo: true };

function ServicosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState<any>(empty);

  const { data = [] } = useQuery({
    queryKey: ["servicos"],
    queryFn: async () => (await supabase.from("servicos").select("*").order("descricao")).data as Servico[] ?? [],
  });

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(s: Servico) { setEditing(s); setForm({ descricao: s.descricao, preco_padrao: s.preco_padrao, ativo: s.ativo }); setOpen(true); }
  async function save() {
    if (!form.descricao.trim()) { toast.error("Descrição é obrigatória"); return; }
    const payload = { ...form, preco_padrao: Number(form.preco_padrao) };
    const { error } = editing
      ? await supabase.from("servicos").update(payload).eq("id", editing.id)
      : await supabase.from("servicos").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Serviço salvo");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["servicos"] });
  }
  async function remove(id: string) {
    if (!confirm("Excluir este serviço?")) return;
    const { error } = await supabase.from("servicos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["servicos"] });
  }
  async function toggleAtivo(s: Servico) {
    await supabase.from("servicos").update({ ativo: !s.ativo }).eq("id", s.id);
    qc.invalidateQueries({ queryKey: ["servicos"] });
  }

  return (
    <div>
      <PageHeader title="Serviços" subtitle="Catálogo e tabela de preços" actions={
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo serviço</Button>
      } />

      <div className="px-6 py-6 lg:px-10">
        <div className="surface-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Descrição</th><th className="px-4 py-3 w-40 text-right">Preço padrão</th><th className="px-4 py-3 w-32">Ativo</th><th className="px-4 py-3 w-24" /></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">Nenhum serviço.</td></tr>}
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-surface-elevated/40">
                  <td className="px-4 py-3 font-medium">{s.descricao}</td>
                  <td className="px-4 py-3 text-right">{brl(s.preco_padrao)}</td>
                  <td className="px-4 py-3"><Switch checked={s.ativo} onCheckedChange={() => toggleAtivo(s)} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="text-muted-foreground hover:text-primary p-1"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label className="text-xs">Descrição *</Label><Input className="mt-1" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
            <div><Label className="text-xs">Preço padrão (R$)</Label><Input type="number" step="0.01" min="0" className="mt-1" value={form.preco_padrao} onChange={(e) => setForm({ ...form, preco_padrao: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} /><Label className="text-sm">Ativo no catálogo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
