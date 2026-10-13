"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const CLASSES = ["Basic 7 Red", "Basic 7 Blue", "Basic 8 Red", "Basic 8 Blue", "Basic 9 Red", "Basic 9 Blue"];
const SUBJECTS = ["English Language", "Mathematics", "Science", "Social Studies", "Computing", "Religious and Moral Education", "Creative Arts and Design", "Career Technology", "Ghanaian Language", "French"];
const COLUMNS = ["CE 1", "CE 2", "CE 3", "CE 4", "HW 1", "HW 2", "HW 3", "HW 4", "HW 5", "CT 1", "CT 2", "CT 3"];
type Row = { studentCode: string; name: string; scores: number[] };

export default function Exercise({ academicYear, term, onMigrated }: { academicYear: string; term: string; onMigrated?: (className: string, subject: string) => void }) {
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
      const response = await fetch(`/api/exercises?${query}`);
      const data = await response.json() as { students?: Row[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to load scores.");
      setRows(data.students ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load scores."); }
    finally { setLoading(false); }
  }, [academicYear, className, subject, term]);

  useEffect(() => { void load(); }, [load]);

  const update = (studentCode: string, index: number, value: string) => {
    const score = Math.min(10, Math.max(0, Number(value) || 0));
    setRows((current) => current.map((row) => row.studentCode === studentCode ? { ...row, scores: row.scores.map((item, position) => position === index ? score : item) } : row));
  };

  async function submit(action: "save" | "migrate") {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/exercises", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, className, subject, term, academicYear, subjectPassword: password, rows: rows.map(({ studentCode, scores }) => ({ studentCode, scores })) }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to save scores.");
      setMessage(action === "migrate" ? "The calculated 30% scores have been migrated to the Scorebook class-score column." : "Continuous-assessment scores saved.");
      if (action === "migrate") onMigrated?.(className, subject);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save scores."); }
    finally { setLoading(false); }
  }

  const classAverage = useMemo(() => rows.length ? Math.round(rows.reduce((sum, row) => sum + row.scores.reduce((a, b) => a + b, 0) / 4, 0) / rows.length) : 0, [rows]);

  return <section className="exercise-workspace">
    <div className="exercise-hero"><div><p>Continuous assessment</p><h2>Exercise, Homework & Class Test Record</h2><span>Each activity is marked over 10. The combined raw score is automatically converted to 30%.</span></div><div className="period-chip"><b>{academicYear}</b><span>{term}</span></div></div>
    <section className="panel exercise-controls"><label>Class<select value={className} onChange={(event) => setClassName(event.target.value)}>{CLASSES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Subject<select value={subject} onChange={(event) => setSubject(event.target.value)}>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select></label><label>Subject password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Only required when authentication is on"/></label><button className="secondary" onClick={() => void load()} disabled={loading}>Refresh</button></section>
    <div className="exercise-summary"><article><strong>{rows.length}</strong><span>Students</span></article><article><strong>{classAverage}/30</strong><span>Class average</span></article><article><strong>12</strong><span>Assessment entries</span></article></div>
    {message && <div className="review-message">{message}</div>}
    <section className="panel exercise-sheet"><div className="panel-head"><div><h2>{subject} · {className}</h2><p>4 class exercises, 5 homework tasks and 3 class tests</p></div><div className="exercise-actions"><button className="secondary" onClick={() => void submit("save")} disabled={loading || !rows.length}>{loading ? "Working…" : "Save assessments"}</button><button className="primary" onClick={() => void submit("migrate")} disabled={loading || !rows.length}>Migrate to Scorebook</button></div></div><div className="exercise-table-wrap"><table><thead><tr><th rowSpan={2}>Index</th><th rowSpan={2}>Student</th><th colSpan={4}>Class Exercise</th><th colSpan={5}>Homework</th><th colSpan={3}>Class Test</th><th rowSpan={2}>Raw<br/>/120</th><th rowSpan={2}>30%</th></tr><tr>{COLUMNS.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{loading && !rows.length ? <tr><td colSpan={16}>Loading students…</td></tr> : !rows.length ? <tr><td colSpan={16}>No students are available in this class. Add students from the Headteacher dashboard first.</td></tr> : rows.map((row) => { const total = row.scores.reduce((sum, score) => sum + score, 0); return <tr key={row.studentCode}><td>{row.studentCode}</td><td><strong>{row.name}</strong></td>{row.scores.map((score, index) => <td key={index}><input type="number" min="0" max="10" value={score} onChange={(event) => update(row.studentCode, index, event.target.value)} aria-label={`${row.name} ${COLUMNS[index]}`}/></td>)}<td><b>{total}</b></td><td><strong>{Math.round(total / 120 * 30)}</strong></td></tr>; })}</tbody></table></div></section>
  </section>;
}
