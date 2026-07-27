"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { COMPUTING_SCHEMES_2026 } from "./computing-scheme-data";

const SUBJECTS = [
  "English Language", "Mathematics", "Science", "Social Studies", "Computing",
  "Religious and Moral Education", "Creative Arts and Design", "Career Technology",
  "Ghanaian Language", "French",
];
const LEVELS = ["Basic 7", "Basic 8", "Basic 9"];
const TERMS = ["Term 1", "Term 2", "Term 3"];
const MAX_FILE_SIZE = 3 * 1024 * 1024;

type Scheme = {
  id: number;
  title: string;
  subject: string;
  level: string;
  term: string;
  academicYear: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

type Filters = { search: string; academicYear: string; term: string; level: string; subject: string };
type SchemeForm = { academicYear: string; term: string; level: string; subject: string; title: string };

const defaultFilters: Filters = { search: "", academicYear: "", term: "", level: "", subject: "" };
const defaultForm: SchemeForm = { academicYear: "2026/2027", term: "Term 1", level: "Basic 7", subject: "English Language", title: "" };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function sizeLabel(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeWord(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export default function SchemeOfWork({ administrator = false, adminPassword = "" }: { administrator?: boolean; adminPassword?: string }) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [form, setForm] = useState<SchemeForm>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [builtInLevel, setBuiltInLevel] = useState("Basic 7");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function downloadComputingScheme() {
    const rows = COMPUTING_SCHEMES_2026[builtInLevel];
    const body = rows.map((item) => `<tr><td>${escapeWord(item.week)}</td><td>${escapeWord(item.date)}</td><td>${escapeWord(item.strand)}</td><td>${escapeWord(item.subStrand)}</td><td>${escapeWord(item.resources)}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;color:#14271f}h1{text-align:center;font-size:18pt;margin:0 0 4px}p{text-align:center;margin:0 0 14px;color:#52675d;font-size:10pt}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8.5pt}th{padding:7px;color:white;background:#087443;border:1px solid #064f35;text-align:left}td{padding:6px;border:1px solid #9fb3a9;vertical-align:top;line-height:1.25}tr:nth-child(even){background:#f2f8f5}th:nth-child(1){width:5%}th:nth-child(2){width:15%}th:nth-child(3){width:16%}th:nth-child(4){width:32%}th:nth-child(5){width:32%}</style></head><body><h1>1ST NOVEMBER 1954 J.H.S.</h1><p>COMPUTING SCHEME OF WORK · ${escapeWord(builtInLevel)} · FIRST TERM · 2026/2027</p><table><thead><tr><th>Week</th><th>Date</th><th>Strand</th><th>Sub-strand</th><th>Resources</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
    const url = URL.createObjectURL(new Blob(["\ufeff", html], { type: "application/msword" }));
    const link = document.createElement("a"); link.href = url; link.download = `${builtInLevel}-Computing-Scheme-of-Work-Term-1-2026-2027.doc`.replaceAll(" ", "-"); link.click(); URL.revokeObjectURL(url);
    setMessage(`${builtInLevel} Computing scheme downloaded in Word format.`);
  }

  async function loadSchemes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
      const response = await fetch(`/api/schemes?${params}`);
      const data = await response.json() as { schemes?: Scheme[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to load schemes of work.");
      setSchemes(data.schemes ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load schemes of work.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadSchemes(); }, 250);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.academicYear, filters.term, filters.level, filters.subject]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
    setReplaceMode(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadScheme(file: File, replaceId?: number) {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.set(key, value));
    payload.set("adminPassword", adminPassword);
    payload.set("file", file);
    if (replaceId) payload.set("replaceId", String(replaceId));
    const response = await fetch("/api/schemes", { method: "POST", body: payload });
    const data = await response.json() as { error?: string; duplicateId?: number; replaced?: boolean };
    if (response.status === 409 && data.duplicateId) {
      if (!confirm(`${data.error}\n\nReplace the existing scheme with this document?`)) return false;
      return uploadScheme(file, data.duplicateId);
    }
    if (!response.ok) throw new Error(data.error ?? "The scheme could not be uploaded.");
    setMessage(data.replaced ? "Scheme of work replaced successfully." : "Scheme of work uploaded successfully.");
    return true;
  }

  async function submitScheme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const file = fileRef.current?.files?.[0];
    if (file && file.size > MAX_FILE_SIZE) return setMessage("The document must be 3 MB or smaller.");
    if (file && !/\.(pdf|doc|docx|xls|xlsx)$/i.test(file.name)) return setMessage("Choose a PDF, DOC, DOCX, XLS or XLSX document.");
    setSaving(true);
    setMessage("");
    try {
      if (editingId && !file && !replaceMode) {
        const response = await fetch("/api/schemes", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, adminPassword, ...form }),
        });
        const data = await response.json() as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Scheme information could not be updated.");
        setMessage("Scheme information updated successfully.");
      } else {
        if (!file) throw new Error("Choose a document to upload.");
        const saved = await uploadScheme(file, editingId ?? undefined);
        if (!saved) return;
      }
      resetForm();
      await loadSchemes();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save the scheme of work.");
    } finally {
      setSaving(false);
    }
  }

  function editScheme(scheme: Scheme, replace = false) {
    setForm({ academicYear: scheme.academicYear, term: scheme.term, level: scheme.level, subject: scheme.subject, title: scheme.title });
    setEditingId(scheme.id);
    setReplaceMode(replace);
    setMessage(replace ? "Choose the replacement document, then save." : "Update the scheme information, then save.");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (replace) window.setTimeout(() => fileRef.current?.click(), 300);
  }

  async function deleteScheme(scheme: Scheme) {
    if (!confirm(`Delete “${scheme.title}”? This document cannot be recovered.`)) return;
    const response = await fetch("/api/schemes", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: scheme.id, adminPassword }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setMessage(data.error ?? "The scheme could not be deleted.");
    setMessage("Scheme of work deleted.");
    await loadSchemes();
  }

  return <section className="scheme-workspace">
    <div className="scheme-hero">
      <div><p>{administrator ? "Administrator library" : "Teacher resource library"}</p><h2>{administrator ? "Scheme of Work Management" : "View Scheme of Work"}</h2><span>{administrator ? "Upload, organise and maintain curriculum documents." : "Find, preview and download approved curriculum documents."}</span></div>
      <strong>{schemes.length}<small>matching document{schemes.length === 1 ? "" : "s"}</small></strong>
    </div>

    <section className="built-in-scheme panel">
      <div className="panel-head"><div><p className="scheme-kicker">NaCCA curriculum · 2026/2027</p><h2>First-Term Computing Scheme</h2><span>8 September–17 December 2026 · Includes public holidays, revision and examinations</span></div><div className="built-in-scheme-actions"><label>Level<select value={builtInLevel} onChange={(event) => setBuiltInLevel(event.target.value)}>{LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label><button className="primary" onClick={downloadComputingScheme}>Download Word</button></div></div>
      <div className="table-scroll"><table className="built-in-scheme-table"><thead><tr><th>Week</th><th>Date</th><th>Strand</th><th>Sub-strand</th><th>Resources</th></tr></thead><tbody>{COMPUTING_SCHEMES_2026[builtInLevel].map((item) => <tr key={item.week}><td>{item.week}</td><td>{item.date}</td><td><strong>{item.strand}</strong></td><td>{item.subStrand}</td><td>{item.resources}</td></tr>)}</tbody></table></div>
    </section>

    {message && <div className="scheme-notice" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss message">×</button></div>}

    {administrator && <form ref={formRef} className="scheme-upload panel" onSubmit={submitScheme}>
      <div className="panel-head"><div><h2>{editingId ? (replaceMode ? "Replace scheme document" : "Edit scheme information") : "Upload scheme of work"}</h2><p>Documents are securely stored and limited to 3 MB.</p></div>{editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel edit</button>}</div>
      <div className="scheme-form-grid">
        <label>Academic year<input required pattern="\d{4}/\d{4}" value={form.academicYear} onChange={(event) => setForm({ ...form, academicYear: event.target.value })} placeholder="2026/2027" /></label>
        <label>Term<select value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })}>{TERMS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Level<select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Subject<select value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })}>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="scheme-title-field">Title or description<input required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Example: Mathematics Term 1 Scheme" /></label>
        <label className="scheme-file-field">Document{editingId && !replaceMode ? " (optional for information-only edits)" : ""}<input ref={fileRef} type="file" required={!editingId || replaceMode} accept=".pdf,.doc,.docx,.xls,.xlsx" /><small>PDF, Word or Excel · Maximum 3 MB</small></label>
      </div>
      <div className="scheme-form-actions"><button className="primary" type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? (replaceMode ? "Replace document" : "Save changes") : "Upload document"}</button></div>
    </form>}

    <div className="scheme-filters panel" role="search">
      <label>Search<input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search title or subject" /></label>
      <label>Academic year<input value={filters.academicYear} onChange={(event) => setFilters({ ...filters, academicYear: event.target.value })} placeholder="All years" /></label>
      <label>Term<select value={filters.term} onChange={(event) => setFilters({ ...filters, term: event.target.value })}><option value="">All terms</option>{TERMS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Level<select value={filters.level} onChange={(event) => setFilters({ ...filters, level: event.target.value })}><option value="">All levels</option>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Subject<select value={filters.subject} onChange={(event) => setFilters({ ...filters, subject: event.target.value })}><option value="">All subjects</option>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <button type="button" className="secondary" onClick={() => setFilters(defaultFilters)}>Clear filters</button>
    </div>

    {loading ? <div className="scheme-empty"><span className="scheme-loader"/>Loading schemes of work…</div> : schemes.length === 0 ? <div className="scheme-empty"><b>Document library is empty</b><span>No scheme of work matches the selected filters.</span></div> : administrator ? <div className="panel scheme-table-wrap"><div className="table-scroll"><table className="scheme-table"><thead><tr><th>File title</th><th>Subject</th><th>Level</th><th>Term</th><th>Academic year</th><th>Format</th><th>Date uploaded</th><th>Uploaded by</th><th>Actions</th></tr></thead><tbody>{schemes.map((scheme) => <tr key={scheme.id}><td><strong>{scheme.title}</strong><small>{scheme.fileName} · {sizeLabel(scheme.fileSize)}</small></td><td>{scheme.subject}</td><td>{scheme.level}</td><td>{scheme.term}</td><td>{scheme.academicYear}</td><td><span className="file-type">{scheme.fileType}</span></td><td>{dateLabel(scheme.updatedAt)}</td><td>{scheme.uploadedBy}</td><td><div className="scheme-actions"><a href={`/api/schemes/${scheme.id}/file`} target="_blank" rel="noreferrer">View</a><a href={`/api/schemes/${scheme.id}/file?download=1`}>Download</a><button onClick={() => editScheme(scheme, true)}>Replace</button><button onClick={() => editScheme(scheme)}>Edit</button><button className="danger-link" onClick={() => void deleteScheme(scheme)}>Delete</button></div></td></tr>)}</tbody></table></div></div> : <div className="scheme-card-grid">{schemes.map((scheme) => <article className="scheme-card" key={scheme.id}><div className="scheme-file-icon">{scheme.fileType}</div><div><span>{scheme.level} · {scheme.term}</span><h3>{scheme.title}</h3><p>{scheme.subject}</p><small>{scheme.academicYear} · Uploaded {dateLabel(scheme.updatedAt)}</small></div><div className="scheme-card-actions"><a className="secondary" href={`/api/schemes/${scheme.id}/file`} target="_blank" rel="noreferrer">View document</a><a className="primary" href={`/api/schemes/${scheme.id}/file?download=1`}>Download</a></div></article>)}</div>}
  </section>;
}
