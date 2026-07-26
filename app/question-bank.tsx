"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const CLASSES = ["Basic 7 Red", "Basic 7 Blue", "Basic 8 Red", "Basic 8 Blue", "Basic 9 Red", "Basic 9 Blue"];
const SUBJECTS = ["English Language", "Mathematics", "Science", "Social Studies", "Computing", "Religious and Moral Education", "Creative Arts and Design", "Career Technology", "Ghanaian Language", "French"];

type Question = {
  id: number;
  className: string;
  subject: string;
  term: string;
  topic: string;
  questionType: "Objective" | "Short Answer" | "Essay";
  difficulty: "Easy" | "Moderate" | "Challenging";
  questionText: string;
  options: string[];
  answer: string;
  marks: number;
  createdBy: string;
  createdAt: string;
};

const emptyQuestion = { topic: "", questionType: "Objective", difficulty: "Moderate", questionText: "", optionsText: "", answer: "", marks: 1, subjectPassword: "" };

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function dataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function QuestionBank() {
  const [scope, setScope] = useState({ className: "Basic 8 Red", subject: "Mathematics" });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [paper, setPaper] = useState<Question[]>([]);
  const [form, setForm] = useState(emptyQuestion);
  const [filters, setFilters] = useState({ search: "", topic: "All", questionType: "All", difficulty: "All" });
  const [paperSettings, setPaperSettings] = useState({ title: "End of Term Examination", instructions: "Answer all questions.", count: 10, includeAnswers: true });
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
      setQuestions(data.questions ?? []);
      setPaper([]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The question bank could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { void loadQuestions(); }, [loadQuestions]);

  const topics = useMemo(() => [...new Set(questions.map((question) => question.topic))].sort(), [questions]);
  const visible = useMemo(() => questions.filter((question) => {
    const search = filters.search.toLowerCase();
    return (!search || `${question.questionText} ${question.topic}`.toLowerCase().includes(search))
      && (filters.topic === "All" || question.topic === filters.topic)
      && (filters.questionType === "All" || question.questionType === filters.questionType)
      && (filters.difficulty === "All" || question.difficulty === filters.difficulty);
  }), [questions, filters]);
  const totalMarks = paper.reduce((sum, question) => sum + question.marks, 0);

  async function addQuestion(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...scope, term: "All Terms", ...form, options: form.optionsText.split("\n") }) });
      const data = await response.json() as { question?: Question; error?: string };
      if (!response.ok || !data.question) throw new Error(data.error || "The question could not be saved.");
      setQuestions((current) => [...current, data.question!]);
      setForm({ ...emptyQuestion, subjectPassword: form.subjectPassword });
      setShowAdd(false);
      setNotice("Question saved successfully.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The question could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(question: Question) {
    if (!window.confirm("Delete this question from the bank? This cannot be undone.")) return;
    try {
      const remove = (subjectPassword: string) => fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id: question.id, className: question.className, subject: question.subject, subjectPassword }) });
      let response = await remove(form.subjectPassword);
      let data = await response.json() as { error?: string; passwordRequired?: boolean };
      if (response.status === 401 && data.passwordRequired) {
        const password = window.prompt("Subject authentication is enabled. Enter the subject-teacher password.");
        if (password === null) return;
        response = await remove(password);
        data = await response.json() as { error?: string; passwordRequired?: boolean };
        if (response.ok) setForm((current) => ({ ...current, subjectPassword: password }));
      }
      if (!response.ok) throw new Error(data.error);
      setQuestions((current) => current.filter((item) => item.id !== question.id));
      setPaper((current) => current.filter((item) => item.id !== question.id));
      setNotice("Question deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The question could not be deleted.");
    }
  }

  function generatePaper() {
    if (!visible.length) return setNotice("Add or adjust the filters to find questions first.");
    const count = Math.min(Math.max(1, paperSettings.count), visible.length);
    const shuffled = [...visible].sort(() => Math.random() - 0.5).slice(0, count);
    setPaper(shuffled);
    setNotice(count < paperSettings.count ? `Only ${count} matching question${count === 1 ? " is" : "s are"} available.` : `Paper generated with ${count} questions.`);
  }

  function togglePaperQuestion(question: Question) {
    setPaper((current) => current.some((item) => item.id === question.id) ? current.filter((item) => item.id !== question.id) : [...current, question]);
  }

  async function downloadWord() {
    if (!paper.length) return setNotice("Generate or select questions before downloading.");
    let logo = "";
    try { logo = await dataUrl(await (await fetch("/school-logo.png")).blob()); } catch { /* Header text remains available. */ }
    const questionHtml = paper.map((question, index) => `<div class="question"><p><b>${index + 1}.</b> ${escapeHtml(question.questionText)} <span>[${question.marks} mark${question.marks === 1 ? "" : "s"}]</span></p>${question.options.length ? `<ol type="A">${question.options.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ol>` : ""}</div>`).join("");
    const answers = paperSettings.includeAnswers ? `<div class="page-break"></div><h2>Answer Key / Marking Guide</h2>${paper.map((question, index) => `<p><b>${index + 1}.</b> ${escapeHtml(question.answer)} <span>[${question.marks} mark${question.marks === 1 ? "" : "s"}]</span></p>`).join("")}` : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:20mm}body{font-family:Arial,sans-serif;color:#15251e;font-size:12pt;line-height:1.5}.header{text-align:center;border-bottom:3px solid #0b6a43;padding-bottom:14px;margin-bottom:20px}.header img{width:85px;height:85px;object-fit:contain;float:left}.header h1{margin:4px 0;color:#073f28;font-size:20pt}.header h2{margin:3px 0;font-size:15pt}.meta{width:100%;border-collapse:collapse;margin:18px 0}.meta td{border:1px solid #9aa9a1;padding:8px}.question{margin:0 0 18px}.question p{margin:0}.question span{float:right;font-weight:bold}.question li{margin:4px 0}.page-break{page-break-before:always}h2{color:#073f28}</style></head><body><div class="header">${logo ? `<img src="${logo}" alt="School logo">` : ""}<h1>1ST NOVEMBER 1954 J.H.S.</h1><h2>${escapeHtml(paperSettings.title)}</h2><div>Assessment Record Management System</div></div><table class="meta"><tr><td><b>Class:</b> ${escapeHtml(scope.className)}</td><td><b>Subject:</b> ${escapeHtml(scope.subject)}</td></tr><tr><td><b>Total Marks:</b> ${totalMarks}</td><td><b>Time:</b> __________________</td></tr><tr><td colspan="2"><b>Name:</b> ____________________________________ &nbsp; <b>Date:</b> __________________</td></tr></table><p><b>Instructions:</b> ${escapeHtml(paperSettings.instructions)}</p>${questionHtml}${answers}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${scope.className}-${scope.subject}-questions.doc`.replaceAll(" ", "-");
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Word document downloaded.");
  }

  return <section className="question-workspace">
    <header className="question-hero"><div><p>Free teaching tool</p><h2>Question Bank &amp; Paper Generator</h2><span>Build reusable assessment papers from questions created by your teachers—no AI fees or subscriptions.</span></div><strong>{questions.length}<small>bank questions</small></strong></header>
    {notice && <div className="question-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
    <section className="question-scope panel"><div><span>Choose a question bank</span><small>Questions are organised only by class and subject.</small></div><label>Class<select value={scope.className} onChange={(event) => setScope({ ...scope, className: event.target.value })}>{CLASSES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Subject<select value={scope.subject} onChange={(event) => setScope({ ...scope, subject: event.target.value })}>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select></label><button className="primary compact" onClick={() => setShowAdd((value) => !value)}>{showAdd ? "Close form" : "+ Add question"}</button></section>
    {showAdd && <section className="panel question-editor"><div className="panel-head"><div><h2>Add to question bank</h2><p>Store a reviewed question for future examination papers.</p></div></div><form onSubmit={addQuestion}><label>Topic<input required value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} placeholder="e.g. Fractions"/></label><label>Question type<select value={form.questionType} onChange={(event) => setForm({ ...form, questionType: event.target.value })}><option>Objective</option><option>Short Answer</option><option>Essay</option></select></label><label>Difficulty<select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })}><option>Easy</option><option>Moderate</option><option>Challenging</option></select></label><label>Marks<input type="number" min="1" max="100" value={form.marks} onChange={(event) => setForm({ ...form, marks: Number(event.target.value) })}/></label><label className="question-wide">Question<textarea required value={form.questionText} onChange={(event) => setForm({ ...form, questionText: event.target.value })} placeholder="Enter the complete question"/></label>{form.questionType === "Objective" && <label className="question-wide">Answer options <small>Enter one option on each line.</small><textarea required value={form.optionsText} onChange={(event) => setForm({ ...form, optionsText: event.target.value })} placeholder={"Option A\nOption B\nOption C\nOption D"}/></label>}<label className="question-wide">Correct answer / marking guide<textarea required value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} placeholder="Enter the expected answer or marking points"/></label><label>Subject password <small>Only required when authentication is on.</small><input type="password" value={form.subjectPassword} onChange={(event) => setForm({ ...form, subjectPassword: event.target.value })} placeholder="Optional"/></label><div className="question-form-action"><button className="primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save question"}</button></div></form></section>}
    <section className="question-builder-grid">
      <div className="panel question-library"><div className="panel-head"><div><h2>Question library</h2><p>{scope.className} · {scope.subject}</p></div><span className="record-count">{visible.length} matching</span></div><div className="question-filters"><label>Search<input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search question or topic"/></label><label>Topic<select value={filters.topic} onChange={(event) => setFilters({ ...filters, topic: event.target.value })}><option>All</option>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select></label><label>Type<select value={filters.questionType} onChange={(event) => setFilters({ ...filters, questionType: event.target.value })}><option>All</option><option>Objective</option><option>Short Answer</option><option>Essay</option></select></label><label>Difficulty<select value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })}><option>All</option><option>Easy</option><option>Moderate</option><option>Challenging</option></select></label></div>{loading ? <div className="question-empty"><i/><b>Loading question bank…</b></div> : visible.length === 0 ? <div className="question-empty"><span>?</span><b>No matching questions</b><p>Add the first reviewed question for this class and subject.</p></div> : <div className="question-list">{visible.map((question) => <article key={question.id} className={paper.some((item) => item.id === question.id) ? "selected" : ""}><button className="question-select" onClick={() => togglePaperQuestion(question)} aria-label={`${paper.some((item) => item.id === question.id) ? "Remove" : "Add"} question ${question.id} ${paper.some((item) => item.id === question.id) ? "from" : "to"} paper`}>{paper.some((item) => item.id === question.id) ? "✓" : "+"}</button><div><span>{question.topic} · {question.questionType} · {question.difficulty}</span><h3>{question.questionText}</h3><small>{question.marks} mark{question.marks === 1 ? "" : "s"} · Added by {question.createdBy}</small></div><button className="question-delete" onClick={() => void deleteQuestion(question)} aria-label="Delete question">Delete</button></article>)}</div>}</div>
      <aside className="panel paper-builder"><div className="panel-head"><div><h2>Build examination paper</h2><p>Use the filtered library or select questions manually.</p></div></div><div className="paper-settings"><label>Paper title<input value={paperSettings.title} onChange={(event) => setPaperSettings({ ...paperSettings, title: event.target.value })}/></label><label>Instructions<textarea value={paperSettings.instructions} onChange={(event) => setPaperSettings({ ...paperSettings, instructions: event.target.value })}/></label><label>Number of questions<input type="number" min="1" max="100" value={paperSettings.count} onChange={(event) => setPaperSettings({ ...paperSettings, count: Number(event.target.value) })}/></label><label className="answer-toggle"><input type="checkbox" checked={paperSettings.includeAnswers} onChange={(event) => setPaperSettings({ ...paperSettings, includeAnswers: event.target.checked })}/><span>Include answer key</span></label><button className="secondary" onClick={generatePaper}>Generate from matching questions</button></div><div className="paper-summary"><div><span>Selected questions</span><strong>{paper.length}</strong></div><div><span>Total marks</span><strong>{totalMarks}</strong></div></div>{paper.length > 0 && <ol className="paper-preview">{paper.map((question) => <li key={question.id}><span>{question.questionText}</span><button onClick={() => togglePaperQuestion(question)} aria-label="Remove from paper">×</button></li>)}</ol>}<button className="primary question-download" onClick={() => void downloadWord()} disabled={!paper.length}>Download Word document</button></aside>
    </section>
  </section>;
}
