import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/motores")({ component: MotoresPage });

type Motor = { id: string; cliente_id: string | null; marca: string | null; modelo: string | null; potencia: string | null; tensao: string | null; rpm: string | null; polos: string | null; frequencia: string | null; observacoes: string | null };

const empty = { cliente_id: "none", marca: "", modelo: "", potencia: "", tensao: "", rpm: "", polos: "", frequencia: "", observacoes: "" };

function MotoresPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Motor | null>(null);
  const [form, setForm] = useState<any>(empty);

  const { data = [] } = useQuery({
    queryKey: ["motores"],
    queryFn: async () => {
      const { data } = await supabase.from("motores").select("*, cliente:clientes(nome)").order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => (await supabase.from("clientes").select("id,nome").order("nome")).data ?? [],
  });

  const filtered = data.filter((m) =>
    [m.marca, m.modelo, m.cliente?.nome].some((v: any) => v?.toLowerCase().includes(q.toLowerCase()))
  );

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(m: Motor) {
    setEditing(m);
    setForm({ ...empty, ...Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v ?? ""])), cliente_id: m.cliente_id ?? "none" });
    setOpen(true);
  }
  async function save() {
    const payload: any = { ...form, cliente_id: form.cliente_id === "none" ? null : form.cliente_id };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });
    delete payload.id; delete (payload as any).cliente;
    const { error } = editing
      ? await supabase.from("motores").update(payload).eq("id", editing.id)
      : await supabase.from("motores").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Motor salvo");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["motores"] });
  }
  async function remove(id: string) {
    if (!confirm("Excluir este motor?")) return;
    const { error } = await supabase.from("motores").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["motores"] });
  }

  return (
    <div>
      <PageHeader title="Motores" subtitle={`${data.length} cadastrados`} actions={
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo motor</Button>
      } />

      <div className="px-6 py-6 lg:px-10 space-y-4">
        <div className="surface-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por marca, modelo, cliente…" className="pl-9 bg-input/40" />
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Marca / Modelo</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Potência</th><th className="px-4 py-3">Tensão</th><th className="px-4 py-3">RPM</th><th className="px-4 py-3 w-24" /></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhum motor.</td></tr>}
              {filtered.map((m: any) => (
                <tr key={m.id} className="hover:bg-surface-elevated/40">
                  <td className="px-4 py-3"><div className="font-medium">{m.marca ?? "—"}</div><div className="text-xs text-muted-foreground">{m.modelo ?? ""}</div></td>
                  <td className="px-4 py-3 text-muted-foreground">{m.cliente?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.potencia ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.tensao ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.rpm ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-primary p-1"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Editar motor" : "Novo motor"}</DialogTitle></DialogHeader>
          <div className="flex items-center justify-end mb-2">
            <Button variant="outline" size="sm" disabled title="Em breve"><Camera className="h-4 w-4 mr-2" /> Ler placa</Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <Label className="text-xs">Cliente</Label>
              <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cliente</SelectItem>
                  {(clientes as any[]).map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {[["marca","Marca"],["modelo","Modelo"],["potencia","Potência"],["tensao","Tensão"],["rpm","RPM"],["polos","Polos"],["frequencia","Frequência"]].map(([k,l]) => (
              <div key={k}><Label className="text-xs">{l}</Label><Input className="mt-1" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div className="sm:col-span-3"><Label className="text-xs">Observações</Label><Textarea className="mt-1" rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
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
