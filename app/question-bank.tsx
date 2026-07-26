"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { buildComputingQuestionBank, computingTopicsForClass } from "./computing-question-bank";

const CLASSES = ["Basic 7", "Basic 8", "Basic 9"];
const SUBJECTS = ["English Language", "Mathematics", "Science", "Social Studies", "Computing", "Religious and Moral Education", "Creative Arts and Design", "Career Technology", "Ghanaian Language", "French"];
const SUBJECT_SHORT: Record<string, string> = { "English Language": "English", Mathematics: "Maths", Science: "Science", "Social Studies": "Social", Computing: "Computing", "Religious and Moral Education": "R.M.E.", "Creative Arts and Design": "Creative Arts", "Career Technology": "Career Tech", "Ghanaian Language": "Ghanaian Lang.", French: "French" };

type PaperType = "Objective" | "Essay" | "Practical";
type Question = { id: number; className: string; subject: string; term: string; topic: string; questionType: "Objective" | "Short Answer" | "Essay" | "Theory" | "Practical"; difficulty: "Easy" | "Moderate" | "Challenging"; questionText: string; options: string[]; answer: string; marks: number; createdBy: string; createdAt: string; source?: "Built-in" };
type TopicChoice = { selected: boolean; count: number; type: PaperType };

const emptyQuestion = { topic: "", questionType: "Objective", difficulty: "Moderate", questionText: "", optionsText: "", answer: "", marks: 1, subjectPassword: "" };
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("\n", "<br>");
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const dataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
const matchesType = (question: Question, type: PaperType) => type === "Essay" ? ["Essay", "Theory", "Short Answer"].includes(question.questionType) : question.questionType === type;

export default function QuestionBank() {
  const [scope, setScope] = useState({ className: "Basic 8", subject: "Computing" });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [paper, setPaper] = useState<Question[]>([]);
  const [choices, setChoices] = useState<Record<string, TopicChoice>>({});
  const [form, setForm] = useState(emptyQuestion);
  const [search, setSearch] = useState("");
  const [paperSettings, setPaperSettings] = useState({ title: "End of Term Examination", instructions: "Answer all questions. Write clearly and show all working where necessary.", includeAnswers: true });
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions?${new URLSearchParams(scope)}`);
      const data = await response.json() as { questions?: Question[]; error?: string };
      if (!response.ok) throw new Error(data.error);
      setQuestions(data.questions ?? []); setPaper([]);
    } catch (error) { setNotice(error instanceof Error ? error.message : "The question bank could not be loaded."); }
    finally { setLoading(false); }
  }, [scope]);
  useEffect(() => { void loadQuestions(); }, [loadQuestions]);

  const builtIn = useMemo(() => scope.subject === "Computing" ? buildComputingQuestionBank(scope.className) : [], [scope]);
  const allQuestions = useMemo(() => [...builtIn, ...questions], [builtIn, questions]);
  const topics = useMemo(() => scope.subject === "Computing" ? computingTopicsForClass(scope.className) : [...new Set(allQuestions.map((question) => question.topic))].sort(), [allQuestions, scope]);
  useEffect(() => {
    setChoices(Object.fromEntries(topics.map((topic) => [topic, { selected: false, count: 1, type: "Objective" as PaperType }])));
    setForm((current) => ({ ...current, topic: topics[0] ?? "", questionType: "Objective" }));
    setPaper([]);
  }, [topics]);
  const filteredLibrary = useMemo(() => allQuestions.filter((question) => !search || `${question.topic} ${question.questionText}`.toLowerCase().includes(search.toLowerCase())), [allQuestions, search]);
  const selectedTopics = Object.entries(choices).filter(([, choice]) => choice.selected);
  const requestedCount = selectedTopics.reduce((sum, [, choice]) => sum + choice.count, 0);
  const totalMarks = paper.reduce((sum, question) => sum + question.marks, 0);

  function updateChoice(topic: string, change: Partial<TopicChoice>) { setChoices((current) => ({ ...current, [topic]: { ...current[topic], ...change } })); }
  function chooseSubject(subject: string) { setScope((current) => ({ ...current, subject })); setSearch(""); setShowAdd(false); }

  function generatePaper() {
    if (!selectedTopics.length) return setNotice("Select at least one topic first.");
    const assembled: Question[] = []; const shortages: string[] = [];
    for (const [topic, choice] of selectedTopics) {
      const available = shuffle(allQuestions.filter((question) => question.topic === topic && matchesType(question, choice.type)));
      assembled.push(...available.slice(0, choice.count));
      if (available.length < choice.count) shortages.push(`${topic}: ${available.length} ${choice.type.toLowerCase()} available`);
    }
    setPaper(assembled);
    setNotice(shortages.length ? `Paper created with ${assembled.length} questions. ${shortages.join("; ")}.` : `Paper created with ${assembled.length} questions from ${selectedTopics.length} topics.`);
  }

  async function addQuestion(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...scope, term: "All Terms", ...form, options: form.optionsText.split("\n").filter(Boolean) }) });
      const data = await response.json() as { question?: Question; error?: string };
      if (!response.ok || !data.question) throw new Error(data.error || "The question could not be saved.");
      setQuestions((current) => [...current, data.question!]); setForm({ ...emptyQuestion, topic: topics[0] ?? "", subjectPassword: form.subjectPassword }); setShowAdd(false); setNotice("Question saved successfully.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "The question could not be saved."); }
    finally { setSaving(false); }
  }

  async function deleteQuestion(question: Question) {
    if (question.source === "Built-in") return setNotice("Built-in curriculum questions are protected.");
    if (!window.confirm("Delete this question from the bank? This cannot be undone.")) return;
    try {
      const remove = (subjectPassword: string) => fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id: question.id, className: question.className, subject: question.subject, subjectPassword }) });
      let response = await remove(form.subjectPassword); let data = await response.json() as { error?: string; passwordRequired?: boolean };
      if (response.status === 401 && data.passwordRequired) { const password = window.prompt("Enter the subject-teacher password."); if (password === null) return; response = await remove(password); data = await response.json(); }
      if (!response.ok) throw new Error(data.error); setQuestions((current) => current.filter((item) => item.id !== question.id)); setNotice("Question deleted.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "The question could not be deleted."); }
  }

  async function downloadWord() {
    if (!paper.length) return setNotice("Generate a paper before downloading.");
    let logo = ""; try { logo = await dataUrl(await (await fetch("/school-logo.png")).blob()); } catch { /* text header remains */ }
    const groups: Array<[PaperType, Question[]]> = [["Essay", paper.filter((q) => matchesType(q, "Essay"))], ["Practical", paper.filter((q) => matchesType(q, "Practical"))], ["Objective", paper.filter((q) => matchesType(q, "Objective"))]];
    const orderedPaper = groups.flatMap(([, items]) => items);
    let number = 0;
    const sections = groups.filter(([, items]) => items.length).map(([type, items], sectionIndex) => {
      const title = type === "Objective" ? "OBJECTIVE TEST" : type === "Practical" ? "PRACTICAL TEST" : "ESSAY";
      const body = items.map((q) => { number += 1; const options = q.options.length ? `<ol type="A">${q.options.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ol>` : `<div class="answer-lines">${"<div></div>".repeat(Math.min(7, Math.max(3, q.marks)))}</div>`; return `<div class="question"><p><b>${number}.</b> ${escapeHtml(q.questionText)} <strong>[${q.marks} marks]</strong></p>${options}</div>`; }).join("");
      return `<div class="${sectionIndex ? "page-break" : "page-break"}"></div><h2>PAPER ${sectionIndex + 1}</h2><h2>${title}</h2><h3>[${items.reduce((sum, q) => sum + q.marks, 0)} marks]</h3><p class="section-instructions">${type === "Objective" ? "Answer all questions. Each question is followed by four options lettered A to D. Choose the correct option for each question." : escapeHtml(paperSettings.instructions)}</p><div class="${type === "Objective" ? "objective-columns" : ""}">${body}</div>`;
    }).join("");
    const answers = paperSettings.includeAnswers ? `<div class="page-break"></div><h2>ANSWER KEY / MARKING GUIDE</h2>${orderedPaper.map((q, i) => `<p><b>${i + 1}.</b> ${escapeHtml(q.answer)} <strong>[${q.marks} marks]</strong></p>`).join("")}` : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:Letter;margin:12.7mm 17.8mm 17.8mm}body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.25;color:#000}.cover{min-height:245mm}.identity{display:flex;gap:24px}.exam-box{border:3px solid #000;padding:10px;width:48%}.exam-box h1{font-size:15pt;margin:0 0 6px}.candidate{width:48%;font-weight:bold;line-height:2.25}.school{text-align:center;margin:20px 0 10px}.school img{width:76px;height:76px;object-fit:contain}.school h1,.school h2{font-size:14pt;margin:3px}.meta{width:100%;border-collapse:collapse;margin:18px 0}.meta td{padding:6px;border-bottom:1px solid #777}.instructions{text-align:justify}.examiner{width:48%;margin:25px auto;border-collapse:collapse}.examiner th,.examiner td{border:1px solid #000;padding:6px}.examiner .space{height:150px}.page-break{page-break-before:always}h2,h3{text-align:center;margin:4px}.section-instructions{text-align:center;font-style:italic}.question{break-inside:avoid;margin:12px 0}.question p{margin:0}.question strong{float:right}.question li{margin:3px 0}.answer-lines div{height:19px;border-bottom:1px dotted #333}.objective-columns{column-count:2;column-gap:28px;column-rule:1px solid #444}.objective-columns .question{display:inline-block;width:100%;margin:4px 0}ol{margin-top:5px}</style></head><body><section class="cover"><div class="identity"><div class="exam-box"><h1>${escapeHtml(paperSettings.title.toUpperCase())}</h1><b>${escapeHtml(scope.subject.toUpperCase())}</b><br>Essay and Objective<br>Time: __________</div><div class="candidate">Name ................................................<br>Class: ${escapeHtml(scope.className)}<br>Signature ............................................<br>Date of Examination: ........................</div></div><div class="school">${logo ? `<img src="${logo}" alt="School logo">` : ""}<h1>1ST NOVEMBER 1954 JUNIOR HIGH SCHOOL</h1><h2>${escapeHtml(paperSettings.title.toUpperCase())}</h2></div><table class="meta"><tr><td><b>Subject:</b> ${escapeHtml(scope.subject)}</td><td><b>Class:</b> ${escapeHtml(scope.className)}</td></tr><tr><td><b>Total Marks:</b> ${totalMarks}</td><td><b>Total Questions:</b> ${paper.length}</td></tr></table><div class="instructions"><p><b>Do not open this booklet until you are told to do so.</b> Write your name, class, signature and date of examination in ink in the spaces above.</p><p>${escapeHtml(paperSettings.instructions)}</p><p>At the end of the examination, submit the entire question paper to the invigilator.</p></div><table class="examiner"><tr><th colspan="2">For Examiner's Use Only</th></tr><tr><th>Question Number</th><th>Mark</th></tr><tr><td class="space"></td><td></td></tr><tr><th>TOTAL</th><td></td></tr></table></section>${sections}${answers}<p style="text-align:center;font-weight:bold;font-style:italic">END OF PAPER</p></body></html>`;
    const url = URL.createObjectURL(new Blob(["\ufeff", html], { type: "application/msword" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${scope.className}-${scope.subject}-examination.doc`.replaceAll(" ", "-"); anchor.click(); URL.revokeObjectURL(url); setNotice("Examination paper downloaded in Word format.");
  }

  return <section className="question-workspace">
    <header className="question-hero"><div><p>Free built-in teaching tool</p><h2>Questions &amp; Examination Papers</h2><span>Select a subject, class and topics, then choose how many questions to include.</span></div><strong>{allQuestions.length}<small>available questions</small></strong></header>
    {notice && <div className="question-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
    <section className="panel subject-picker"><div className="panel-head"><div><h2>1. Choose a subject</h2><p>Every configured subject has its own question bank.</p></div></div><div className="subject-button-grid">{SUBJECTS.map((subject, index) => <button key={subject} className={scope.subject === subject ? "active" : ""} onClick={() => chooseSubject(subject)}><span>{index + 1}</span>{SUBJECT_SHORT[subject]}</button>)}</div></section>
    <section className="panel class-picker"><div><h2>2. Choose one class</h2><p>The class selection applies to all chosen topics.</p></div><div className="class-radio-grid" role="radiogroup" aria-label="Class">{CLASSES.map((className) => <label key={className} className={scope.className === className ? "active" : ""}><input type="radio" name="question-class" value={className} checked={scope.className === className} onChange={() => setScope((current) => ({ ...current, className }))}/><span>{className}</span></label>)}</div></section>
    <section className="panel topic-planner"><div className="panel-head"><div><h2>3. Select topics and question quantities</h2><p>Computing includes objective, essay and practical. Other subjects include objective and essay only.</p></div><button className="secondary compact" onClick={() => setShowAdd((value) => !value)}>{showAdd ? "Close form" : "+ Add question"}</button></div>
      {loading ? <div className="question-empty"><b>Loading question bank…</b></div> : topics.length === 0 ? <div className="question-empty"><span>?</span><b>No topics available for {scope.subject}</b><p>Add reviewed questions to create this subject's topic list.</p></div> : <div className="topic-selection-list">{topics.map((topic) => { const choice = choices[topic] ?? { selected: false, count: 1, type: "Objective" as PaperType }; const available = allQuestions.filter((q) => q.topic === topic && matchesType(q, choice.type)).length; return <article key={topic} className={choice.selected ? "selected" : ""}><label className="topic-check"><input type="checkbox" checked={choice.selected} onChange={(e) => updateChoice(topic, { selected: e.target.checked })}/><span><b>{topic}</b><small>{available} {choice.type.toLowerCase()} questions available</small></span></label><fieldset disabled={!choice.selected}><legend>Type</legend>{(["Objective", "Essay", ...(scope.subject === "Computing" ? ["Practical"] : [])] as PaperType[]).map((type) => <label key={type}><input type="radio" name={`type-${topic}`} checked={choice.type === type} onChange={() => updateChoice(topic, { type })}/>{type}</label>)}</fieldset><label className="topic-count">Number<input type="number" min="1" max="50" disabled={!choice.selected} value={choice.count} onChange={(e) => updateChoice(topic, { count: Math.max(1, Number(e.target.value)) })}/></label></article>; })}</div>}
    </section>
    {showAdd && <section className="panel question-editor"><div className="panel-head"><div><h2>Add a reviewed question</h2><p>Saved questions become available under the selected subject and class.</p></div></div><form onSubmit={addQuestion}><label>Topic{scope.subject === "Computing" ? <select required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select> : <input required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}/>}</label><label>Question type<select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value })}><option>Objective</option><option>Essay</option>{scope.subject === "Computing" && <option>Practical</option>}</select></label><label>Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option>Easy</option><option>Moderate</option><option>Challenging</option></select></label><label>Marks<input type="number" min="1" max="100" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}/></label><label className="question-wide">Question<textarea required value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })}/></label>{form.questionType === "Objective" && <label className="question-wide">Answer options <small>One option per line</small><textarea required value={form.optionsText} onChange={(e) => setForm({ ...form, optionsText: e.target.value })}/></label>}<label className="question-wide">Answer / marking guide<textarea required value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}/></label><label>Subject password<input type="password" value={form.subjectPassword} onChange={(e) => setForm({ ...form, subjectPassword: e.target.value })} placeholder="Only when authentication is on"/></label><button className="primary" disabled={saving}>{saving ? "Saving…" : "Save question"}</button></form></section>}
    <section className="question-builder-grid"><div className="panel question-library"><div className="panel-head"><div><h2>Question library</h2><p>{scope.className} · {scope.subject}</p></div><span className="record-count">{filteredLibrary.length}</span></div><label>Search questions<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by topic or question"/></label><div className="question-list">{filteredLibrary.slice(0, 100).map((question) => <article key={question.id}><div><span>{question.topic} · {question.questionType}</span><h3>{question.questionText}</h3><small>{question.marks} marks · {question.createdBy}</small></div>{question.source !== "Built-in" && <button className="question-delete" onClick={() => void deleteQuestion(question)}>Delete</button>}</article>)}</div></div>
      <aside className="panel paper-builder"><div className="panel-head"><div><h2>4. Build examination paper</h2><p>Your export follows the supplied school examination format.</p></div></div><div className="paper-settings"><label>Paper title<input value={paperSettings.title} onChange={(e) => setPaperSettings({ ...paperSettings, title: e.target.value })}/></label><label>Instructions<textarea value={paperSettings.instructions} onChange={(e) => setPaperSettings({ ...paperSettings, instructions: e.target.value })}/></label><label className="answer-toggle"><input type="checkbox" checked={paperSettings.includeAnswers} onChange={(e) => setPaperSettings({ ...paperSettings, includeAnswers: e.target.checked })}/><span>Include answer key</span></label><button className="secondary" onClick={generatePaper} disabled={!requestedCount}>Generate {requestedCount || ""} questions</button></div><div className="paper-summary"><div><span>Selected topics</span><strong>{selectedTopics.length}</strong></div><div><span>Paper questions</span><strong>{paper.length}</strong></div><div><span>Total marks</span><strong>{totalMarks}</strong></div></div><button className="primary question-download" onClick={() => void downloadWord()} disabled={!paper.length}>Download formatted Word paper</button></aside></section>
  </section>;
}
