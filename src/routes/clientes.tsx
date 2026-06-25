import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({ component: ClientesPage });

type Cliente = { id: string; nome: string; empresa: string | null; telefone: string | null; email: string | null };
const empty = { nome: "", empresa: "", telefone: "", email: "" };

function ClientesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(empty);

  const { data = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("*").order("nome");
      return (data ?? []) as Cliente[];
    },
  });

  const filtered = data.filter((c) =>
    [c.nome, c.empresa, c.telefone, c.email].some((v) => v?.toLowerCase().includes(q.toLowerCase()))
  );

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({ nome: c.nome, empresa: c.empresa ?? "", telefone: c.telefone ?? "", email: c.email ?? "" });
    setOpen(true);
  }
  async function save() {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    const payload = { ...form, empresa: form.empresa || null, telefone: form.telefone || null, email: form.email || null };
    const { error } = editing
      ? await supabase.from("clientes").update(payload).eq("id", editing.id)
      : await supabase.from("clientes").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Cliente salvo");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["clientes"] });
  }
  async function remove(id: string) {
    if (!confirm("Excluir este cliente?")) return;
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cliente removido");
    qc.invalidateQueries({ queryKey: ["clientes"] });
  }

  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${data.length} cadastrados`} actions={
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo cliente</Button>
      } />

      <div className="px-6 py-6 lg:px-10 space-y-4">
        <div className="surface-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="pl-9 bg-input/40" />
          </div>
        </div>
        <div className="surface-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3 w-24" /></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Nenhum cliente.</td></tr>}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-elevated/40">
                  <td className="px-4 py-3 font-medium">{c.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.empresa ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-primary p-1"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label className="text-xs">Nome *</Label><Input className="mt-1" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div><Label className="text-xs">Empresa</Label><Input className="mt-1" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">Telefone</Label><Input className="mt-1" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
              <div><Label className="text-xs">E-mail</Label><Input type="email" className="mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
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
