"use client";

import { useEffect, useState } from "react";
import { BUILT_IN_SCHEME_SUBJECTS, getBuiltInScheme } from "./subject-scheme-data";

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

const competenciesBySubject: Record<string, string> = {
  Computing: "Digital Literacy; Communication and Collaboration; Critical Thinking and Problem-Solving",
  "English Language": "Communication and Collaboration; Critical Thinking and Problem-Solving; Creativity and Innovation",
  Mathematics: "Critical Thinking and Problem-Solving; Communication and Collaboration; Personal Development and Leadership",
  Science: "Critical Thinking and Problem-Solving; Creativity and Innovation; Communication and Collaboration",
  "Social Studies": "Cultural Identity and Global Citizenship; Communication and Collaboration; Critical Thinking and Problem-Solving",
  "Religious and Moral Education": "Cultural Identity and Global Citizenship; Personal Development and Leadership; Communication and Collaboration",
  "Creative Arts and Design": "Creativity and Innovation; Cultural Identity and Global Citizenship; Communication and Collaboration",
  "Career Technology": "Creativity and Innovation; Critical Thinking and Problem-Solving; Personal Development and Leadership",
  "Ghanaian Language": "Communication and Collaboration; Cultural Identity and Global Citizenship; Creativity and Innovation",
  French: "Communication and Collaboration; Cultural Identity and Global Citizenship; Personal Development and Leadership",
};

function weeklyActivities(subject: string, className: string, week: string, strand: string, subStrand: string): DayRow[] {
  const topic = subStrand.split(" — ")[0];
  if (strand === "Revision") return [
    { dayDate: "Tuesday", starter: `Learners recall the major ${subject} concepts studied during the term and identify areas requiring clarification.`, main: `1. Teacher organises learners into groups to review the strands and sub-strands covered.\n2. Learners complete guided revision activities on ${topic}.\n3. Groups compare answers, explain their reasoning and correct misconceptions.\n4. Teacher provides individual support and a short BECE-style practice task.`, reflection: "Learners state the concepts they can now explain confidently. Teacher reviews difficult items and gives a short individual revision exercise." },
    { dayDate: "Friday", starter: "Learners respond to a short oral quiz based on the term's work.", main: `1. Learners complete a mixed individual exercise covering the term.\n2. Teacher discusses answers and acceptable response methods.\n3. Learners correct their work and prepare a personal examination checklist.`, reflection: "Review examination techniques and correct remaining misconceptions. Learners complete a short exit task." },
  ];
  if (strand === "End-of-Term Examination") return [
    { dayDate: "Tuesday", starter: "Teacher explains the assessment instructions and confirms that learners understand the required procedures.", main: `Learners complete the end-of-term ${subject} assessment independently under the school's examination conditions.`, reflection: "Teacher collects and checks all scripts or practical evidence according to school procedures." },
    { dayDate: "Thursday", starter: "Teacher returns to common areas of difficulty identified during assessment.", main: "Teacher leads feedback and correction activities. Learners explain improved answers and record corrections in their exercise books.", reflection: "Learners identify one strength and one area for continued improvement." },
  ];
  return [
    { dayDate: "Tuesday", starter: `Display or describe a familiar example connected to ${topic}. Learners share what they already know and suggest where the idea is used in daily life.`, main: `1. Introduce the lesson purpose and key vocabulary for ${topic}.\n2. Use the listed resources to model or explain the central idea.\n3. Learners work in pairs to observe, discuss, classify, calculate, read, create or demonstrate as appropriate for ${subject}.\n4. Groups report their findings while the teacher clarifies accurate concepts and corrects misconceptions.\n5. Learners complete a guided task appropriate for ${className}.`, reflection: `Through questions and answers, learners explain the key ideas in ${topic}. Teacher summarises the lesson and gives a short individual exercise aligned with the lesson indicator.` },
    { dayDate: "Friday", starter: `Review the previous lesson on ${topic} through a quick quiz, demonstration or think-pair-share activity.`, main: `1. Learners apply ${topic} to a practical, written or real-life problem.\n2. Individuals first attempt the task, then compare approaches in groups.\n3. Teacher observes performance, asks probing questions and supports learners who need help.\n4. Groups present or demonstrate their work using appropriate ${subject} language.\n5. Learners improve their work from peer and teacher feedback.`, reflection: `Learners state or demonstrate what they can now do. Teacher corrects misconceptions, records observed progress and assigns a short practice task or homework.` },
  ];
}

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

  function loadFromScheme(subject = note.subject, className = note.className, week = note.week) {
    const row = getBuiltInScheme(subject, className)[Math.max(0, Math.min(14, Number(week || 1) - 1))];
    if (!row) return;
    setNote((current) => ({
      ...current, subject, className, week,
      strand: row.strand,
      subStrand: row.subStrand,
      weekEnding: row.date,
      references: `NaCCA ${subject} Curriculum and approved ${className} ${subject} textbook; Teacher Resource Pack; Learner Resource Pack.`,
      resources: row.resources,
      competencies: competenciesBySubject[subject] ?? "Communication and Collaboration; Critical Thinking and Problem-Solving",
      days: weeklyActivities(subject, className, week, row.strand, row.subStrand),
    }));
    setMessage(`${className} ${subject}, Week ${week}, loaded from the scheme of work. Review and edit the curriculum codes before export.`);
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
    const days = note.days.map((day) => `<tr><td>${escapeWord(day.dayDate)}</td><td>${escapeWord(day.starter)}</td><td>${escapeWord(day.main)}</td><td>${escapeWord(day.reflection)}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 portrait;margin:7mm 7mm 18mm}body{font-family:"Times New Roman",serif;font-size:11pt;color:#000}p{margin:0 0 4pt;font-weight:bold}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #000;padding:6px;vertical-align:top;line-height:1.25}th{font-weight:bold;text-align:left}.phase th{text-align:center}.phase th:nth-child(1){width:12%}.phase th:nth-child(2){width:23%}.phase th:nth-child(3){width:42%}.phase th:nth-child(4){width:23%}.phase{display:table-header-group}</style></head><body><p>Name of Teacher: ${escapeWord(note.teacherName)}</p><p>School: ${escapeWord(note.school)}</p><p>WEEK: ${escapeWord(note.week)}</p><table><tbody><tr><th>Strand:</th><td>${escapeWord(note.strand)}</td><th>Sub-Strand:</th><td>${escapeWord(note.subStrand)}</td></tr><tr><th>Content Standard:</th><td colspan="3">${escapeWord(note.contentStandard)}</td></tr><tr><th>Indicator(s)</th><td>${escapeWord(note.indicators)}</td><th>Performance Indicator:</th><td>${escapeWord(note.performanceIndicator)}</td></tr><tr><th>Week Ending</th><td colspan="3">${escapeWord(note.weekEnding)}</td></tr><tr><th>Class</th><td>${escapeWord(note.className)}</td><td><b>Class Size:</b> ${escapeWord(note.classSize)}</td><td><b>Duration:</b> ${escapeWord(note.duration)}</td></tr><tr><th>Subject</th><td colspan="3">${escapeWord(note.subject)}</td></tr><tr><th>Reference</th><td colspan="3">${escapeWord(note.references)}</td></tr><tr><th>Teaching / Learning Resources</th><td>${escapeWord(note.resources)}</td><th>Core Competencies:</th><td>${escapeWord(note.competencies)}</td></tr></tbody><thead class="phase"><tr><th>DAY/DATE</th><th>PHASE 1: STARTER</th><th>PHASE 2: MAIN</th><th>PHASE 3: REFLECTION</th></tr></thead><tbody>${days}</tbody></table></body></html>`;
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

    <div className="lesson-scheme-loader panel"><div><h3>Prepare from Scheme of Work</h3><p>Select a subject, class and week to load the matching weekly lesson-note content.</p></div><div><label>Subject<select value={note.subject} onChange={(e) => update("subject", e.target.value)}>{BUILT_IN_SCHEME_SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label><label>Class<select value={note.className} onChange={(e) => updateClass(e.target.value)}><option>Basic 7</option><option>Basic 8</option><option>Basic 9</option></select></label><label>Week<select value={note.week} onChange={(e) => update("week", e.target.value)}>{Array.from({ length: 15 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label><button className="primary" onClick={() => loadFromScheme()}>Prepare weekly note</button></div></div>

    <div className="lesson-form-section panel"><h3>Document heading</h3><div className="lesson-form-grid">
      <label>Teacher&apos;s name<input value={note.teacherName} onChange={(e) => update("teacherName", e.target.value)} placeholder="Enter teacher's full name"/></label>
      <label>School<input value={note.school} onChange={(e) => update("school", e.target.value)}/></label>
      <label>Class<select value={note.className} onChange={(e) => updateClass(e.target.value)}><option>Basic 7</option><option>Basic 8</option><option>Basic 9</option></select></label>
      <label>Week<input type="number" min="1" max="52" value={note.week} onChange={(e) => update("week", e.target.value)}/></label>
      <label>Week ending<input value={note.weekEnding} onChange={(e) => update("weekEnding", e.target.value)} placeholder="Enter date or teaching-week range"/></label>
      <label>Subject<select value={note.subject} onChange={(e) => update("subject", e.target.value)}>{BUILT_IN_SCHEME_SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
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
