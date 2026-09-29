"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Paginated } from "@/lib/types";

type Folder = { id: number; name: string; kind: string };
type Doc = { id: number; title: string; folder: number; folder_name?: string; file_url?: string; version: number; created_at: string };

const KINDS = [
  ["company", "Company Documents"],
  ["employee", "Employee Documents"],
  ["dealer", "Dealer Documents"],
  ["vendor", "Vendor Documents"],
];

export default function DocumentsPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("company");
  const [folderName, setFolderName] = useState("");
  const [title, setTitle] = useState("");
  const [folder, setFolder] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function load() {
    api<Folder[]>("/api/erp/folders/").then(setFolders);
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    api<Paginated<Doc>>(`/api/erp/documents/?${p}`).then((d) => setDocs(d.results));
  }
  useEffect(() => { load(); }, []);

  async function addFolder(e: FormEvent) {
    e.preventDefault();
    await api("/api/erp/folders/", { method: "POST", body: JSON.stringify({ name: folderName, kind }) });
    setFolderName("");
    load();
  }

  async function upload(e: FormEvent) {
    e.preventDefault();
    if (!file || !folder) return toast.error("Folder and file required");
    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("title", title);
    fd.append("file", file);
    await api("/api/erp/documents/", { method: "POST", body: fd });
    toast.success("Uploaded");
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">Document Management</h1>
        <p className="text-sm text-slate-500">Company / employee / dealer / vendor folders · upload, search, version history</p>
      </div>
      <form onSubmit={addFolder} className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 dark:bg-slate-900">
        <Select value={kind} onChange={(e) => setKind(e.target.value)}>
          {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <Input placeholder="Folder name" value={folderName} onChange={(e) => setFolderName(e.target.value)} required />
        <Button>Create folder</Button>
      </form>
      <form onSubmit={upload} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-4">
        <div>
          <Label>Folder</Label>
          <Select value={folder} onChange={(e) => setFolder(e.target.value)} required>
            <option value="">Select</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.kind} / {f.name}</option>)}
          </Select>
        </div>
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
        <div><Label>File</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
        <div className="flex items-end"><Button>Upload</Button></div>
      </form>
      <div className="flex gap-2">
        <Input placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="outline" type="button" onClick={load}>Search</Button>
      </div>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Folder</th><th className="px-4 py-3">Ver</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-2 font-semibold">{d.title}</td>
                <td className="px-4 py-2">{d.folder_name}</td>
                <td className="px-4 py-2">v{d.version}</td>
                <td className="px-4 py-2">{d.file_url && <a className="text-electric font-semibold" href={d.file_url} target="_blank">Download</a>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
