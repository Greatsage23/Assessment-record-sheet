"use client";

import { FormEvent, useState } from "react";

type SubmittedNote = {
  id: number; teacherName: string; subject: string; className: string; week: string; strand: string; subStrand: string;
  status: string; headteacherComment: string; createdAt: string; reviewedAt?: string | null;
  noteData: { contentStandard?: string; indicators?: string; performanceIndicator?: string; days?: Array<{ dayDate: string; starter: string; main: string; reflection: string }> };
};

export default function HeadteacherDashboard() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [notes, setNotes] = useState<SubmittedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  async function loadNotes(secret = password) {
    setLoading(true);
    try {
      const response = await fetch("/api/lesson-notes", { headers: { "x-headteacher-password": secret } });
      const data = await response.json() as { notes?: SubmittedNote[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to open the headteacher dashboard.");
      setNotes(data.notes ?? []); setUnlocked(true); setMessage("");
    } catch (error) { setUnlocked(false); setMessage(error instanceof Error ? error.message : "Unable to open the headteacher dashboard."); }
    finally { setLoading(false); }
  }

  async function login(event: FormEvent) { event.preventDefault(); await loadNotes(); }

  async function review(id: number, status: "Approved" | "Returned") {
    setLoading(true);
    try {
      const response = await fetch("/api/lesson-notes", { method: "PATCH", headers: { "Content-Type": "application/json", "x-headteacher-password": password }, body: JSON.stringify({ id, status, comment: comments[id] || "" }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to review the lesson note.");
      setMessage(`Lesson note ${status.toLowerCase()}.`); await loadNotes();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to review the lesson note."); setLoading(false); }
  }

  if (!unlocked) return <section className="headteacher-lock panel"><span className="headteacher-lock-icon">🔐</span><p className="eyebrow">Restricted area</p><h2>Headteacher access</h2><p>Enter the headteacher password to vet and approve submitted lesson notes.</p><form onSubmit={login}><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter headteacher password" autoFocus/></label><button className="primary" disabled={loading}>{loading ? "Checking…" : "Open Dashboard"}</button></form>{message && <div className="review-message">{message}</div>}</section>;

  return <section className="headteacher-review"><div className="headteacher-banner"><div><p>Lesson-note supervision</p><h2>Headteacher Review Dashboard</h2><span>Vet submitted weekly lesson notes, record feedback and approve or return them.</span></div><button className="secondary" onClick={() => { setUnlocked(false); setPassword(""); setNotes([]); }}>Logout</button></div>{message && <div className="review-message">{message}</div>}
    <div className="review-summary"><article><strong>{notes.filter((note) => note.status === "Pending").length}</strong><span>Pending review</span></article><article><strong>{notes.filter((note) => note.status === "Approved").length}</strong><span>Approved</span></article><article><strong>{notes.filter((note) => note.status === "Returned").length}</strong><span>Returned</span></article></div>
    <div className="review-list">{loading ? <div className="review-empty">Loading submitted lesson notes…</div> : notes.length === 0 ? <div className="review-empty">No lesson notes have been submitted for review.</div> : notes.map((note) => <article key={note.id} className={`review-card status-${note.status.toLowerCase()}`}><div className="review-card-head"><div><span className="review-status">{note.status}</span><h3>{note.subject} · {note.className} · Week {note.week}</h3><p>{note.teacherName} · Submitted {new Date(note.createdAt).toLocaleDateString()}</p></div><button className="secondary" onClick={() => setExpanded(expanded === note.id ? null : note.id)}>{expanded === note.id ? "Hide note" : "View note"}</button></div><div className="review-curriculum"><span><b>Strand</b>{note.strand}</span><span><b>Sub-strand</b>{note.subStrand}</span></div>{expanded === note.id && <div className="review-detail"><p><b>Content Standard:</b> {note.noteData.contentStandard || "Not provided"}</p><p><b>Indicator(s):</b> {note.noteData.indicators || "Not provided"}</p><p><b>Performance Indicator:</b> {note.noteData.performanceIndicator || "Not provided"}</p>{note.noteData.days?.map((day, index) => <div key={index}><h4>{day.dayDate || `Teaching day ${index + 1}`}</h4><p><b>Starter:</b> {day.starter}</p><p><b>Main:</b> {day.main}</p><p><b>Reflection:</b> {day.reflection}</p></div>)}</div>}<label>Headteacher comment<textarea value={comments[note.id] ?? note.headteacherComment} onChange={(event) => setComments({ ...comments, [note.id]: event.target.value })} placeholder="Enter observations, corrections or approval comments…"/></label><div className="review-actions"><button className="return-note" onClick={() => void review(note.id, "Returned")} disabled={loading}>Return for correction</button><button className="approve-note" onClick={() => void review(note.id, "Approved")} disabled={loading}>Approve lesson note</button></div></article>)}</div>
  </section>;
}
