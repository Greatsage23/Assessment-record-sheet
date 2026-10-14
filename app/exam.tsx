"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const CLASSES = ["Basic 7 Red", "Basic 7 Blue", "Basic 8 Red", "Basic 8 Blue", "Basic 9 Red", "Basic 9 Blue"];
const SUBJECTS = ["English Language", "Mathematics", "Science", "Social Studies", "Computing", "Religious and Moral Education", "Creative Arts and Design", "Career Technology", "Ghanaian Language", "French"];
type Row = { studentCode: string; name: string; rawScore: number };

export default function Exam({ academicYear, term, onMigrated }: { academicYear: string; term: string; onMigrated?: (className: string, subject: string) => void }) {
  const [className, setClassName] = useState("Basic 7 Red");
  const [subject, setSubject] = useState("English Language");
  const [rows, setRows] = useState<Row[]>([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setMessage("");
    try {
      const query = new URLSearchParams({ className, subject, term, academicYear });
      const response = await fetch(`/api/exams?${query}`);
      const data = await response.json() as { students?: Row[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to load examination scores.");
      setRows(data.students ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load examination scores."); }
    finally { setLoading(false); }
  }, [academicYear, className, subject, term]);

  useEffect(() => { void load(); }, [load]);

  const update = (studentCode: string, value: string) => {
    const rawScore = Math.min(100, Math.max(0, Number(value) || 0));
    setRows((current) => current.map((row) => row.studentCode === studentCode ? { ...row, rawScore } : row));
  };

  async function submit(action: "save" | "migrate") {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, className, subject, term, academicYear, subjectPassword: password, rows: rows.map(({ studentCode, rawScore }) => ({ studentCode, rawScore })) }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to save examination scores.");
      setMessage(action === "migrate" ? "The calculated 70% examination scores have been migrated to the Scorebook." : "Examination scores saved.");
      if (action === "migrate") onMigrated?.(className, subject);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save examination scores."); }
    finally { setLoading(false); }
  }

  const average = useMemo(() => rows.length ? Math.round(rows.reduce((sum, row) => sum + row.rawScore, 0) / rows.length) : 0, [rows]);

  return <section className="exercise-workspace exam-workspace">
    <div className="exercise-hero exam-hero"><div><p>End-of-term examination</p><h2>Examination Score Record</h2><span>Enter each examination mark out of 100. The system automatically converts it to the 70% Scorebook mark.</span></div><div className="period-chip"><b>{academicYear}</b><span>{term}</span></div></div>
    <section className="panel exercise-controls"><label>Class<select value={className} onChange={(event) => setClassName(event.target.value)}>{CLASSES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Subject<select value={subject} onChange={(event) => setSubject(event.target.value)}>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select></label><label>Subject password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Only required when authentication is on"/></label><button className="secondary" onClick={() => void load()} disabled={loading}>Refresh</button></section>
    <div className="exercise-summary"><article><strong>{rows.length}</strong><span>Students</span></article><article><strong>{average}/100</strong><span>Raw class average</span></article><article><strong>{Math.round(average * .7)}/70</strong><span>Converted average</span></article></div>
    {message && <div className="review-message">{message}</div>}
    <section className="panel exam-score-sheet"><div className="panel-head"><div><h2>{subject} · {className}</h2><p>Enter raw examination marks and migrate the calculated 70% when ready.</p></div><div className="exercise-actions"><button className="secondary" onClick={() => void submit("save")} disabled={loading || !rows.length}>{loading ? "Working…" : "Save exam scores"}</button><button className="primary" onClick={() => void submit("migrate")} disabled={loading || !rows.length}>Migrate to Scorebook</button></div></div><div className="exam-entry-grid">{loading && !rows.length ? <p>Loading students…</p> : !rows.length ? <p>No students are available in this class.</p> : rows.map((row, index) => <article key={row.studentCode}><span className="exam-position">{index + 1}</span><div><strong>{row.name}</strong><small>Index: {row.studentCode}</small></div><label>Exam /100<input type="number" inputMode="decimal" min="0" max="100" value={row.rawScore} onChange={(event) => update(row.studentCode, event.target.value)} aria-label={`${row.name} examination score out of 100`}/></label><span className="exam-converted"><small>70%</small><b>{Math.round(row.rawScore * .7)}</b></span></article>)}</div></section>
  </section>;
}
