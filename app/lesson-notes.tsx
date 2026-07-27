"use client";

import { useEffect, useState } from "react";

type DayRow = { dayDate: string; starter: string; main: string; reflection: string };
type LessonNote = {
  teacherName: string; school: string; className: string; week: string; weekEnding: string;
  subject: string; strand: string; subStrand: string; contentStandard: string; indicators: string;
  performanceIndicator: string; classSize: string; duration: string; references: string;
  resources: string; competencies: string; days: DayRow[];
};

const STORAGE_KEY = "jhs-lesson-note-draft";
const emptyDay = (): DayRow => ({ dayDate: "", starter: "", main: "", reflection: "" });
const initialNote: LessonNote = {
  teacherName: "", school: "1st November 1954 J.H.S.", className: "Basic 7", week: "1", weekEnding: "",
  subject: "Computing", strand: "", subStrand: "", contentStandard: "", indicators: "",
  performanceIndicator: "", classSize: "", duration: "60 minutes", references: "NaCCA Computing Curriculum and approved Basic 7 Computing textbook.",
  resources: "Computers or laptops, projector, charts, approved textbook, videos and practical equipment.",
  competencies: "Digital Literacy; Communication and Collaboration; Critical Thinking and Problem-Solving",
  days: [emptyDay(), emptyDay(), emptyDay()],
};

function escapeWord(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("\n", "<br>");
}

export default function LessonNotes() {
  const [note, setNote] = useState<LessonNote>(initialNote);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setNote(JSON.parse(saved) as LessonNote);
    } catch { /* Keep a clean draft when saved data is unavailable. */ }
  }, []);

  function update<K extends keyof LessonNote>(key: K, value: LessonNote[K]) {
    setNote((current) => ({ ...current, [key]: value }));
  }

  function updateClass(className: string) {
    const oldClass = note.className;
    update("className", className);
    if (!note.references || note.references.includes(oldClass)) update("references", `NaCCA Computing Curriculum and approved ${className} Computing textbook.`);
  }

  function updateDay(index: number, key: keyof DayRow, value: string) {
    update("days", note.days.map((day, dayIndex) => dayIndex === index ? { ...day, [key]: value } : day));
  }

  function saveDraft() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
    setMessage("Lesson-note draft saved on this device.");
  }

  function newDraft() {
    if (!window.confirm("Start a new lesson note? The current unsaved changes will be cleared.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setNote(initialNote);
    setMessage("A new lesson-note draft is ready.");
  }

  function exportWord() {
    const info = (label: string, value: string) => `<tr><th>${label}</th><td colspan="3">${escapeWord(value)}</td></tr>`;
    const days = note.days.map((day) => `<tr><td>${escapeWord(day.dayDate)}</td><td>${escapeWord(day.starter)}</td><td>${escapeWord(day.main)}</td><td>${escapeWord(day.reflection)}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 portrait;margin:12mm}body{font-family:"Times New Roman",serif;font-size:11pt;color:#000}h1{text-align:center;font-size:15pt;margin:0 0 12pt}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #000;padding:7px;vertical-align:top;line-height:1.3}th{font-weight:bold;background:#eee;text-align:left}.label{width:21%}.phase th{text-align:center}.phase th:nth-child(1){width:13%}.phase th:nth-child(2){width:25%}.phase th:nth-child(3){width:37%}.phase th:nth-child(4){width:25%}tr{page-break-inside:avoid}.phase{display:table-header-group}</style></head><body><h1>WEEKLY LESSON NOTE</h1><table><tbody>${info("Name of Teacher", note.teacherName)}${info("School", note.school)}${info("Week", note.week)}${info("Strand", note.strand)}${info("Sub-strand", note.subStrand)}${info("Content Standard", note.contentStandard)}${info("Indicator(s)", note.indicators)}${info("Performance Indicator", note.performanceIndicator)}${info("Week Ending", note.weekEnding)}${info("Class", note.className)}${info("Class Size", note.classSize)}${info("Duration", note.duration)}${info("Subject", note.subject)}${info("References", note.references)}${info("Teaching and Learning Resources", note.resources)}${info("Core Competencies", note.competencies)}</tbody><thead class="phase"><tr><th>Day/Date</th><th>Phase 1: Starter</th><th>Phase 2: Main</th><th>Phase 3: Reflection</th></tr></thead><tbody>${days}</tbody></table></body></html>`;
    const url = URL.createObjectURL(new Blob(["\ufeff", html], { type: "application/msword" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${note.className}-Computing-Week-${note.week}-Lesson-Note.doc`.replaceAll(" ", "-");
    link.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
    setMessage("Lesson note exported in Microsoft Word format.");
  }

  return <section className="lesson-editor">
    <div className="lesson-editor-toolbar">
      <div><p className="eyebrow">Editable teaching document</p><h2>Weekly Computing Lesson Note</h2><span>Complete the NaCCA curriculum details and lesson activities, then export the formal lesson note.</span></div>
      <div><button className="secondary" onClick={newDraft}>New note</button><button className="secondary" onClick={saveDraft}>Save draft</button><button className="primary" onClick={exportWord}>Export to Word</button></div>
    </div>
    {message && <div className="scheme-notice" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss message">×</button></div>}

    <div className="lesson-form-section panel"><h3>Document heading</h3><div className="lesson-form-grid">
      <label>Teacher&apos;s name<input value={note.teacherName} onChange={(e) => update("teacherName", e.target.value)} placeholder="Enter teacher's full name"/></label>
      <label>School<input value={note.school} onChange={(e) => update("school", e.target.value)}/></label>
      <label>Class<select value={note.className} onChange={(e) => updateClass(e.target.value)}><option>Basic 7</option><option>Basic 8</option><option>Basic 9</option></select></label>
      <label>Week<input type="number" min="1" max="52" value={note.week} onChange={(e) => update("week", e.target.value)}/></label>
      <label>Week ending<input type="date" value={note.weekEnding} onChange={(e) => update("weekEnding", e.target.value)}/></label>
      <label>Subject<input value={note.subject} onChange={(e) => update("subject", e.target.value)}/></label>
    </div></div>

    <div className="lesson-form-section panel"><h3>Curriculum information</h3><p className="lesson-helper">Enter the exact content standard, indicator and curriculum codes from the official NaCCA curriculum.</p><div className="lesson-form-grid">
      <label>Strand<input value={note.strand} onChange={(e) => update("strand", e.target.value)} placeholder="Official curriculum strand"/></label>
      <label>Sub-strand<input value={note.subStrand} onChange={(e) => update("subStrand", e.target.value)} placeholder="Official curriculum sub-strand"/></label>
      <label className="lesson-wide">Content Standard<textarea value={note.contentStandard} onChange={(e) => update("contentStandard", e.target.value)} placeholder="Enter the exact standard and code"/></label>
      <label className="lesson-wide">Indicator(s)<textarea value={note.indicators} onChange={(e) => update("indicators", e.target.value)} placeholder="Enter the exact indicator(s) and code(s)"/></label>
      <label className="lesson-wide">Performance Indicator<textarea value={note.performanceIndicator} onChange={(e) => update("performanceIndicator", e.target.value)} placeholder="By the end of the lesson, learners will be able to…"/></label>
    </div></div>

    <div className="lesson-form-section panel"><h3>Lesson information</h3><div className="lesson-form-grid">
      <label>Class size<input type="number" min="1" value={note.classSize} onChange={(e) => update("classSize", e.target.value)} placeholder="Number of learners"/></label>
      <label>Duration<input value={note.duration} onChange={(e) => update("duration", e.target.value)}/></label>
      <label className="lesson-wide">References<textarea value={note.references} onChange={(e) => update("references", e.target.value)}/></label>
      <label className="lesson-wide">Teaching and Learning Resources<textarea value={note.resources} onChange={(e) => update("resources", e.target.value)}/></label>
      <label className="lesson-wide">Core Competencies<textarea value={note.competencies} onChange={(e) => update("competencies", e.target.value)}/></label>
    </div></div>

    <div className="lesson-days panel"><div className="panel-head"><div><h3>Lesson development</h3><p>Add one row for every teaching day. Include learner-centred activities and aligned assessment.</p></div><button className="secondary" onClick={() => update("days", [...note.days, emptyDay()])}>+ Add teaching day</button></div>
      <div className="lesson-day-list">{note.days.map((day, index) => <article key={index}><div className="lesson-day-head"><strong>Teaching day {index + 1}</strong>{note.days.length > 1 && <button onClick={() => update("days", note.days.filter((_, dayIndex) => dayIndex !== index))}>Remove</button>}</div><label>Day/Date<input value={day.dayDate} onChange={(e) => updateDay(index, "dayDate", e.target.value)} placeholder="e.g. Tuesday, 15 September 2026"/></label><label>Phase 1: Starter<textarea value={day.starter} onChange={(e) => updateDay(index, "starter", e.target.value)} placeholder="Previous knowledge, questions, demonstration and expected learner responses…"/></label><label>Phase 2: Main<textarea className="lesson-main-text" value={day.main} onChange={(e) => updateDay(index, "main", e.target.value)} placeholder="Numbered teacher and learner activities, explanatory notes, practical work and resources…"/></label><label>Phase 3: Reflection<textarea value={day.reflection} onChange={(e) => updateDay(index, "reflection", e.target.value)} placeholder="Review, correction of misconceptions, summary and assessment task…"/></label></article>)}</div>
    </div>
  </section>;
}
