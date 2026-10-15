"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

type SubmittedNote = {
  id: number; teacherName: string; subject: string; className: string; week: string; strand: string; subStrand: string;
  status: string; headteacherComment: string; createdAt: string; reviewedAt?: string | null;
  noteData: { school?: string; weekEnding?: string; classSize?: string; duration?: string; references?: string; resources?: string; competencies?: string; contentStandard?: string; indicators?: string; performanceIndicator?: string; days?: Array<{ dayDate: string; starter: string; main: string; reflection: string }> };
};

function escapeHtml(value: unknown) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("\n", "<br>");
}

function approvedNoteHtml(note: SubmittedNote, assetOrigin = "") {
  const days = note.noteData.days?.map((day) => `<tr><td>${escapeHtml(day.dayDate)}</td><td>${escapeHtml(day.starter)}</td><td>${escapeHtml(day.main)}</td><td>${escapeHtml(day.reflection)}</td></tr>`).join("") ?? "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(note.subject)} Lesson Note</title><style>@page{size:A4 portrait;margin:10mm}body{font-family:"Times New Roman",serif;color:#111;font-size:10.5pt}h1{text-align:center;font-size:17pt;margin:0 0 4pt}.meta{text-align:center;margin-bottom:10pt}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{padding:6px;border:1px solid #222;vertical-align:top;line-height:1.25}th{background:#eef6f1;text-align:left}.days th{text-align:center}.approval{margin-top:12pt;padding-top:8pt;border-top:1px solid #777}.approval strong{display:block;color:#087443}.verification{margin-top:8pt;display:flex;align-items:flex-end;justify-content:space-between;gap:24pt}.verification figure{margin:0;text-align:center}.verification img{display:block;object-fit:contain}.verification .signature{width:150px;height:55px}.verification .stamp{width:230px;height:92px}.verification figcaption{padding-top:3pt;border-top:1px solid #555;font-size:8.5pt;font-weight:bold}</style></head><body><h1>1ST NOVEMBER 1954 J.H.S.</h1><div class="meta"><b>APPROVED WEEKLY LESSON NOTE</b><br>${escapeHtml(note.subject)} · ${escapeHtml(note.className)} · Week ${escapeHtml(note.week)}</div><table><tr><th>Teacher</th><td>${escapeHtml(note.teacherName)}</td><th>Week ending</th><td>${escapeHtml(note.noteData.weekEnding)}</td></tr><tr><th>Strand</th><td>${escapeHtml(note.strand)}</td><th>Sub-strand</th><td>${escapeHtml(note.subStrand)}</td></tr><tr><th>Content Standard</th><td colspan="3">${escapeHtml(note.noteData.contentStandard)}</td></tr><tr><th>Indicator(s)</th><td colspan="3">${escapeHtml(note.noteData.indicators)}</td></tr><tr><th>Performance Indicator</th><td colspan="3">${escapeHtml(note.noteData.performanceIndicator)}</td></tr><tr><th>Duration</th><td>${escapeHtml(note.noteData.duration)}</td><th>Class size</th><td>${escapeHtml(note.noteData.classSize)}</td></tr><tr><th>Resources</th><td colspan="3">${escapeHtml(note.noteData.resources)}</td></tr><tr><th>Core Competencies</th><td colspan="3">${escapeHtml(note.noteData.competencies)}</td></tr></table><table class="days"><thead><tr><th>DAY/DATE</th><th>PHASE 1: STARTER</th><th>PHASE 2: MAIN</th><th>PHASE 3: REFLECTION</th></tr></thead><tbody>${days}</tbody></table><div class="approval"><strong>HEADTEACHER VERIFICATION: APPROVED</strong>Comment: ${escapeHtml(note.headteacherComment || "Approved for classroom use.")}<div class="verification"><figure><img class="signature" src="${assetOrigin}/headteacher-signature.png" alt="Headteacher signature"><figcaption>HEADTEACHER SIGNATURE</figcaption></figure><figure><img class="stamp" src="${assetOrigin}/headmaster-stamp.png" alt="Official headmaster stamp"><figcaption>OFFICIAL SCHOOL STAMP · ${escapeHtml(note.reviewedAt ? new Date(note.reviewedAt).toLocaleDateString() : "")}</figcaption></figure></div></div></body></html>`;
}

export default function HeadteacherDashboard({ children, onAuthenticated, activeSection = "notes" }: { children?: ReactNode; onAuthenticated?: (password: string) => void; activeSection?: "students" | "teachers" | "notes" }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [notes, setNotes] = useState<SubmittedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<Record<number, string>>({});
  const [reviewDates, setReviewDates] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const notesByTeacher = useMemo(() => Object.entries(notes.reduce<Record<string, SubmittedNote[]>>((groups, note) => {
    (groups[note.teacherName || "Unassigned teacher"] ??= []).push(note);
    return groups;
  }, {})).sort(([first], [second]) => first.localeCompare(second)), [notes]);

  async function loadNotes(secret = password) {
    setLoading(true);
    try {
      const response = await fetch("/api/lesson-notes", { headers: { "x-headteacher-password": secret } });
      const data = await response.json() as { notes?: SubmittedNote[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to open the headteacher dashboard.");
      setNotes(data.notes ?? []); setUnlocked(true); onAuthenticated?.(secret); setMessage("");
    } catch (error) { setUnlocked(false); setMessage(error instanceof Error ? error.message : "Unable to open the headteacher dashboard."); }
    finally { setLoading(false); }
  }

  async function login(event: FormEvent) { event.preventDefault(); await loadNotes(); }

  async function review(id: number, status: "Approved" | "Returned") {
    setLoading(true);
    try {
      const note = notes.find((item) => item.id === id);
      const reviewDate = reviewDates[id] || (note?.reviewedAt ? note.reviewedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
      const response = await fetch("/api/lesson-notes", { method: "PATCH", headers: { "Content-Type": "application/json", "x-headteacher-password": password }, body: JSON.stringify({ id, status, comment: comments[id] || "", reviewDate }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to review the lesson note.");
      setMessage(`Lesson note ${status.toLowerCase()}.`); await loadNotes();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to review the lesson note."); setLoading(false); }
  }

  function exportApprovedWord(note: SubmittedNote) {
    const url = URL.createObjectURL(new Blob(["\ufeff", approvedNoteHtml(note, window.location.origin)], { type: "application/msword" }));
    const link = document.createElement("a"); link.href = url; link.download = `${note.className}-${note.subject}-Week-${note.week}-Approved.doc`.replaceAll(" ", "-"); link.click(); URL.revokeObjectURL(url);
    setMessage("Approved lesson note exported to Word.");
  }

  function exportApprovedPdf(note: SubmittedNote) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return setMessage("Allow pop-ups to open the printable PDF document.");
    printWindow.document.write(approvedNoteHtml(note, window.location.origin)); printWindow.document.close(); printWindow.focus(); window.setTimeout(() => printWindow.print(), 500);
    setMessage("Use Save as PDF in the print window to export the verified lesson note.");
  }

  async function deleteApprovedNote(note: SubmittedNote) {
    if (!window.confirm(`Delete the approved ${note.subject} lesson note for ${note.className}, Week ${note.week}? This cannot be undone.`)) return;
    const confirmationPassword = window.prompt("Enter the Headteacher login password to confirm deletion:");
    if (confirmationPassword === null) return;
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/lesson-notes", { method: "DELETE", headers: { "Content-Type": "application/json", "x-headteacher-password": confirmationPassword }, body: JSON.stringify({ id: note.id }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to delete the approved lesson note.");
      setNotes((current) => current.filter((item) => item.id !== note.id));
      setMessage("Approved lesson note deleted successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete the approved lesson note."); }
    finally { setLoading(false); }
  }

  if (!unlocked) return <section className="headteacher-lock panel"><span className="headteacher-lock-icon">🔐</span><p className="eyebrow">Restricted area</p><h2>Headteacher access</h2><p>Enter the headteacher password to vet and approve submitted lesson notes.</p><form onSubmit={login}><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter headteacher password" autoFocus/></label><button className="primary" disabled={loading}>{loading ? "Checking…" : "Open Dashboard"}</button></form>{message && <div className="review-message">{message}</div>}</section>;

  return <section className="headteacher-review"><div className="headteacher-banner"><div><p>Lesson-note supervision</p><h2>Headteacher Review Dashboard</h2><span>Vet submitted weekly lesson notes, record feedback and approve or return them.</span></div><button className="secondary" onClick={() => { setUnlocked(false); setPassword(""); setNotes([]); onAuthenticated?.(""); }}>Logout</button></div>{message && <div className="review-message">{message}</div>}
    {children}
    {activeSection === "notes" && <><div className="review-summary"><article><strong>{notes.filter((note) => note.status === "Pending").length}</strong><span>Pending review</span></article><article><strong>{notes.filter((note) => note.status === "Approved").length}</strong><span>Approved</span></article><article><strong>{notes.filter((note) => note.status === "Returned").length}</strong><span>Returned</span></article></div>
    <section className="approved-repository"><div className="approved-repository-head"><div><p className="eyebrow">Verified teaching documents</p><h2>Approved Lesson Notes Repository</h2><span>Download approved notes with the official headteacher signature and school stamp.</span></div><strong>{notes.filter((note) => note.status === "Approved").length} approved</strong></div><div className="approved-note-grid">{notes.filter((note) => note.status === "Approved").length === 0 ? <div className="review-empty">No approved lesson notes are available yet.</div> : notes.filter((note) => note.status === "Approved").map((note) => <article key={`approved-${note.id}`}><img className="verified-stamp-image" src="/headmaster-stamp.png" alt="Official school stamp"/><div><small>{note.subject} · {note.className}</small><h3>Week {note.week}: {note.subStrand || note.strand}</h3><p>{note.teacherName}</p><em>Approved {note.reviewedAt ? new Date(note.reviewedAt).toLocaleDateString() : ""}</em></div><div className="approved-actions"><button className="secondary" onClick={() => exportApprovedWord(note)}>Word</button><button className="primary" onClick={() => exportApprovedPdf(note)}>PDF</button><button className="delete-approved-note" onClick={() => void deleteApprovedNote(note)} disabled={loading}>Delete</button></div></article>)}</div></section>
    <div className="review-list">{loading ? <div className="review-empty">Loading submitted lesson notes…</div> : notes.length === 0 ? <div className="review-empty">No lesson notes have been submitted for review.</div> : notesByTeacher.map(([teacherName, teacherNotes]) => <section className="teacher-note-group" key={teacherName}><header><div><span className="teacher-group-avatar">{teacherName.split(/\s+/).slice(0, 2).map((name) => name[0]).join("")}</span><div><h3>{teacherName}</h3><p>{teacherNotes.length} submitted lesson note{teacherNotes.length === 1 ? "" : "s"}</p></div></div><span>{teacherNotes.filter((note) => note.status === "Pending").length} pending</span></header><div>{teacherNotes.map((note) => <article key={note.id} className={`review-card status-${note.status.toLowerCase()}`}><div className="review-card-head"><div><span className="review-status">{note.status}</span><h3>{note.subject} · {note.className} · Week {note.week}</h3><p>Submitted {new Date(note.createdAt).toLocaleDateString()}</p></div><button className="secondary" onClick={() => setExpanded(expanded === note.id ? null : note.id)}>{expanded === note.id ? "Hide note" : "View note"}</button></div><div className="review-curriculum"><span><b>Strand</b>{note.strand}</span><span><b>Sub-strand</b>{note.subStrand}</span></div>{expanded === note.id && <div className="review-detail"><p><b>Content Standard:</b> {note.noteData.contentStandard || "Not provided"}</p><p><b>Indicator(s):</b> {note.noteData.indicators || "Not provided"}</p><p><b>Performance Indicator:</b> {note.noteData.performanceIndicator || "Not provided"}</p>{note.noteData.days?.map((day, index) => <div key={index}><h4>{day.dayDate || `Teaching day ${index + 1}`}</h4><p><b>Starter:</b> {day.starter}</p><p><b>Main:</b> {day.main}</p><p><b>Reflection:</b> {day.reflection}</p></div>)}</div>}<div className="review-inputs"><label>Headteacher comment<textarea value={comments[note.id] ?? note.headteacherComment} onChange={(event) => setComments({ ...comments, [note.id]: event.target.value })} placeholder="Enter observations, corrections or approval comments…"/></label><label className="vetting-date">Date vetted<input type="date" value={reviewDates[note.id] ?? (note.reviewedAt ? note.reviewedAt.slice(0, 10) : new Date().toISOString().slice(0, 10))} onChange={(event) => setReviewDates({ ...reviewDates, [note.id]: event.target.value })}/><small>This date appears on the approved document.</small></label></div><div className="review-actions"><button className="return-note" onClick={() => void review(note.id, "Returned")} disabled={loading}>Return for correction</button><button className="approve-note" onClick={() => void review(note.id, "Approved")} disabled={loading}>Approve lesson note</button></div></article>)}</div></section>)}</div></>}
  </section>;
}
