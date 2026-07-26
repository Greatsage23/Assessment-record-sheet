"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SchemeOfWork from "./scheme-of-work";

type Student = {
  id: number;
  studentCode: string;
  name: string;
  className: string;
  subject: string;
  term: string;
  classScore: number;
  examScore: number;
};
type RosterStudent = { id: number; studentCode: string; name: string; className: string };

type View = "dashboard" | "scorebook" | "administrator" | "schemes" | "reports" | "overall" | "settings";
type AdminSection = "students" | "teachers" | "passwords" | "schemes";
type ReportDetails = {
  academicYear: string;
  gender: string;
  address: string;
  contact: string;
  daysOpened: number;
  daysPresent: number;
  behaviour: string;
  punctuality: string;
  attitude: string;
  participation: string;
  teacherComment: string;
  headteacherComment: string;
  classTeacherName: string;
  headteacherName: string;
};

const SCHOOL_NAME = "1st November 1954 J.H.S.";
const JHS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Science",
  "Social Studies",
  "Computing",
  "Religious and Moral Education",
  "Creative Arts and Design",
  "Career Technology",
  "Ghanaian Language",
  "French",
] as const;
const SCHOOL_CLASSES = ["Basic 7 Red", "Basic 7 Blue", "Basic 8 Red", "Basic 8 Blue", "Basic 9 Red", "Basic 9 Blue"] as const;
const GRADE_LEVELS = ["Basic 7", "Basic 8", "Basic 9"] as const;

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "scorebook", label: "Scorebook", icon: "book" },
  { id: "administrator", label: "Administrator", icon: "settings" },
  { id: "schemes", label: "Scheme of Work", icon: "book" },
  { id: "reports", label: "Reports", icon: "chart" },
  { id: "overall", label: "Overall Performance", icon: "chart" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 16v-5M12 16V7M17 16V4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.83 2.83-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-4v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-2.83-2.83.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3v-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06L7.04 4.3l.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V2h4v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 2.83 2.83-.06.06A1.65 1.65 0 0 0 19.4 9c.12.6.65 1.03 1.26 1.03H21v4h-.34c-.61 0-1.14.43-1.26 1z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
    close: <><path d="M18 6 6 18M6 6l12 12"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function gradeFor(total: number) {
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  return "F";
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function nextRosterIndex(roster: RosterStudent[]) {
  const highest = roster.reduce((maximum, student) => {
    const number = Number.parseInt(student.studentCode, 10);
    return Number.isFinite(number) ? Math.max(maximum, number) : maximum;
  }, 0);
  return String(highest + 1).padStart(3, "0");
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [view, setView] = useState<View>("scorebook");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState<"subjectLogin" | "scores" | "report" | null>(null);
  const [filter, setFilter] = useState({ className: "Basic 8 Red", subject: "Mathematics", term: "Term 1" });
  const [overallGrade, setOverallGrade] = useState("Basic 8");
  const [overallRecords, setOverallRecords] = useState<Student[]>([]);
  const [overallLoading, setOverallLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminLoginPending, setAdminLoginPending] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSection>("students");
  const [subjectPassword, setSubjectPassword] = useState("");
  const [passwordForm, setPasswordForm] = useState({ className: "Basic 8 Red", subject: "Mathematics", password: "" });
  const [configuredPasswords, setConfiguredPasswords] = useState<{ className: string; subject: string; updatedAt: string }[]>([]);
  const [authenticationOn, setAuthenticationOn] = useState(false);
  const [authenticationStatusKnown, setAuthenticationStatusKnown] = useState(false);
  const [scoreEntryPending, setScoreEntryPending] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ className: "Basic 8 Red", subject: "Mathematics", teacherName: "" });
  const [teacherAssignments, setTeacherAssignments] = useState<{ className: string; subject: string; teacherName: string; updatedAt: string }[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [rosterForm, setRosterForm] = useState({ name: "" });
  const [rosterLoading, setRosterLoading] = useState(false);
  const [reportRecords, setReportRecords] = useState<Student[]>([]);
  const [reportStudentCode, setReportStudentCode] = useState("");
  const [reportDetails, setReportDetails] = useState<ReportDetails>({
    academicYear: "2026/2027",
    gender: "",
    address: "Box 184 E/R Tamale",
    contact: "0244138609",
    daysOpened: 60,
    daysPresent: 0,
    behaviour: "Very Good",
    punctuality: "Very Good",
    attitude: "Very Good",
    participation: "Very Good",
    teacherComment: "",
    headteacherComment: "",
    classTeacherName: "",
    headteacherName: "",
  });

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filter);
      const response = await fetch(`/api/records?${params}`);
      if (!response.ok) throw new Error("Could not load records");
      const data = await response.json() as { students: Student[] };
      setStudents(data.students);
    } catch {
      setMessage("Records could not be loaded. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadStudents(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadStudents]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ className: filter.className, subject: filter.subject });
    fetch(`/api/teachers?${params}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : { teacherName: "" })
      .then((data: { teacherName?: string }) => setSelectedTeacher(data.teacherName ?? ""))
      .catch(() => undefined);
    return () => controller.abort();
  }, [filter.className, filter.subject]);

  const visible = useMemo(() => students.filter((s) =>
    `${s.name} ${s.studentCode}`.toLowerCase().includes(search.toLowerCase())
  ), [students, search]);
  const average = students.length ? Math.round(students.reduce((sum, s) => sum + s.classScore + s.examScore, 0) / students.length) : 0;
  const passed = students.filter((s) => s.classScore + s.examScore >= 50).length;
  const passRate = students.length ? Math.round((passed / students.length) * 100) : 0;
  const highest = students.length ? Math.max(...students.map((s) => s.classScore + s.examScore)) : 0;
  const overallStudents = useMemo(() => {
    const learners = new Map<string, { studentCode: string; name: string; className: string; subjectScores: Record<string, number> }>();
    for (const record of overallRecords) {
      const key = `${record.className}::${record.studentCode}`;
      if (!learners.has(key)) learners.set(key, { studentCode: record.studentCode, name: record.name, className: record.className, subjectScores: {} });
      learners.get(key)!.subjectScores[record.subject] = record.classScore + record.examScore;
    }
    return [...learners.values()].map((learner) => {
      const scores = JHS_SUBJECTS.map((subject) => learner.subjectScores[subject] ?? 0);
      return {
        ...learner,
        total: scores.reduce((sum, score) => sum + score, 0),
        average: scores.reduce((sum, score) => sum + score, 0) / JHS_SUBJECTS.length,
      };
    }).sort((a, b) => b.average - a.average);
  }, [overallRecords]);
  const subjectPerformance = useMemo(() => JHS_SUBJECTS.map((subject) => {
    const results = overallRecords.filter((record) => record.subject === subject);
    const totals = results.map((record) => record.classScore + record.examScore);
    return {
      subject,
      learners: results.length,
      average: totals.length ? Math.round(totals.reduce((sum, score) => sum + score, 0) / totals.length) : 0,
      highest: totals.length ? Math.max(...totals) : 0,
      passRate: totals.length ? Math.round((totals.filter((score) => score >= 50).length / totals.length) * 100) : 0,
    };
  }), [overallRecords]);

  async function updateScores(student: Student, classScore: number, examScore: number) {
    const response = await fetch("/api/records", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...student, classScore, examScore, subjectPassword }),
    });
    if (!response.ok) {
      setMessage("Score not saved. The subject password may have changed.");
      return;
    }
    setStudents((current) => current.map((s) => s.id === student.id ? { ...s, classScore, examScore } : s));
  }

  const loadRoster = useCallback(async () => {
    if (!adminUnlocked) return;
    setRosterLoading(true);
    try {
      const params = new URLSearchParams({ className: filter.className });
      const response = await fetch(`/api/roster?${params}`);
      const data = await response.json() as { roster: RosterStudent[] };
      setRoster(data.roster ?? []);
    } finally {
      setRosterLoading(false);
    }
  }, [adminUnlocked, filter.className]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRoster(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRoster]);

  async function unlockAdministrator(event: FormEvent) {
    event.preventDefault();
    if (adminLoginPending) return;
    setAdminLoginPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/access", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin-login", adminPassword }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Administrator login failed.");
        return;
      }
      setAdminUnlocked(true);
      setMessage("Administrator access granted.");
      void Promise.allSettled([
        loadConfiguredPasswords(adminPassword),
        loadTeacherAssignments(adminPassword),
      ]);
    } catch {
      setMessage("Administrator login could not reach the server. Please try again.");
    } finally {
      setAdminLoginPending(false);
    }
  }

  async function loadTeacherAssignments(password = adminPassword) {
    const response = await fetch("/api/teachers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list", adminPassword: password }),
    });
    if (!response.ok) return;
    const data = await response.json() as { assignments: { className: string; subject: string; teacherName: string; updatedAt: string }[] };
    setTeacherAssignments(data.assignments ?? []);
  }

  async function saveSubjectTeacher(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/teachers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set", adminPassword, ...teacherForm }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setMessage(data.error ?? "The subject teacher could not be saved.");
    setMessage(`${teacherForm.teacherName} assigned to ${teacherForm.subject} · ${teacherForm.className}.`);
    if (teacherForm.className === filter.className && teacherForm.subject === filter.subject) setSelectedTeacher(teacherForm.teacherName.trim());
    setTeacherForm({ ...teacherForm, teacherName: "" });
    await loadTeacherAssignments();
  }

  async function loadConfiguredPasswords(password = adminPassword) {
    const response = await fetch("/api/access", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list", adminPassword: password }),
    });
    const data = await response.json() as { error?: string; configured?: { className: string; subject: string; updatedAt: string }[]; authenticationOn?: boolean };
    if (!response.ok) {
      setMessage(data.error ?? "Authentication settings could not be loaded.");
      return;
    }
    setConfiguredPasswords(data.configured ?? []);
    setAuthenticationOn(Boolean(data.authenticationOn));
    setAuthenticationStatusKnown(true);
  }

  async function toggleAuthentication() {
    const response = await fetch("/api/access", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-authentication", adminPassword }),
    });
    const data = await response.json() as { error?: string; authenticationOn?: boolean };
    if (!response.ok) return setMessage(data.error ?? "Authentication mode could not be changed.");
    setAuthenticationOn(Boolean(data.authenticationOn));
    setAuthenticationStatusKnown(true);
    setMessage(data.authenticationOn ? "Authentication is ON. Teachers must enter the assigned subject password." : "Authentication is OFF. Teachers can enter scores without a password.");
  }

  async function saveSubjectPassword(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/access", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set", adminPassword,
        className: passwordForm.className, subject: passwordForm.subject, subjectPassword: passwordForm.password,
      }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setMessage(data.error ?? "Password could not be assigned.");
    setPasswordForm({ ...passwordForm, password: "" });
    setMessage(`Password assigned to ${passwordForm.subject} · ${passwordForm.className}.`);
    await loadConfiguredPasswords();
  }

  async function unlockSubject(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/access", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "subject-login", className: filter.className, subject: filter.subject, subjectPassword }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setMessage(data.error ?? "Access denied.");
    setModal("scores");
    setMessage(`${filter.subject} score entry unlocked for ${filter.className}.`);
  }

  async function openScoreEntry() {
    if (scoreEntryPending) return;
    if (authenticationStatusKnown && !authenticationOn) {
      setSubjectPassword("");
      setModal("scores");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    setScoreEntryPending(true);
    setMessage("Checking score-entry access…");
    try {
      const response = await fetch("/api/access", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subject-login", className: filter.className, subject: filter.subject, subjectPassword: "" }),
        signal: controller.signal,
      });
      const data = await response.json() as { error?: string; passwordRequired?: boolean };
      setSubjectPassword("");
      if (response.ok && !data.passwordRequired) {
        setAuthenticationOn(false);
        setAuthenticationStatusKnown(true);
        setMessage("");
        setModal("scores");
        return;
      }
      if (data.passwordRequired) {
        setAuthenticationOn(true);
        setAuthenticationStatusKnown(true);
        setMessage("");
        setModal("subjectLogin");
        return;
      }
      setMessage(data.error ?? "Score entry could not be opened.");
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === "AbortError"
        ? "Score entry took too long to respond. Please try again."
        : "Score entry could not reach the server. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      setScoreEntryPending(false);
    }
  }

  async function addRosterStudents(studentsToAdd: { name: string }[]) {
    const response = await fetch("/api/roster", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword, students: studentsToAdd.map((student) => ({ ...student, className: filter.className })) }),
    });
    const data = await response.json() as { error?: string; added?: number };
    if (!response.ok) {
      setMessage(data.error ?? "Students could not be added.");
      return;
    }
    setRosterForm({ name: "" });
    setMessage(`${data.added ?? 0} student${data.added === 1 ? "" : "s"} added. Blank records for every subject and term, including report cards, are ready.`);
    await Promise.all([loadRoster(), loadStudents()]);
  }

  async function addRosterStudent(event: FormEvent) {
    event.preventDefault();
    await addRosterStudents([rosterForm]);
  }

  async function uploadRoster(file: File) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: "" });
    const parsed = rows.map((row) => ({
      name: String(row[0] ?? "").trim(),
    })).filter((student, index) => student.name && !(index === 0 && /student|name/i.test(student.name)));
    if (!parsed.length) {
      setMessage("The Excel sheet should contain student names in column A.");
      return;
    }
    await addRosterStudents(parsed);
  }

  async function removeRosterStudent(student: RosterStudent) {
    if (!confirm(`Remove ${student.name} from the student list, all subjects, and report cards?`)) return;
    const response = await fetch("/api/roster", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword, id: student.id }),
    });
    setMessage(response.ok ? `${student.name} was removed from every subject.` : "The student could not be removed.");
    if (response.ok) await Promise.all([loadRoster(), loadStudents()]);
  }

  function exportCsv() {
    const header = ["School", "Class", "Term", "Subject", "Student ID", "Student", "Class Score (30)", "Exam Score (70)", "Total (100)", "Grade", "Status"];
    const rows = students.map((s) => [SCHOOL_NAME, filter.className, filter.term, filter.subject, s.studentCode, s.name, s.classScore, s.examScore, s.classScore + s.examScore, gradeFor(s.classScore + s.examScore), s.classScore + s.examScore >= 50 ? "Passed" : "Needs support"]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadCsv(csv, `${filter.className}-${filter.subject}-${filter.term}-score-sheet.csv`);
  }

  function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replaceAll(" ", "-");
    link.click();
    URL.revokeObjectURL(url);
  }

  async function loadOverallPerformance(gradeLevel = overallGrade) {
    setOverallLoading(true);
    setOverallGrade(gradeLevel);
    setView("overall");
    try {
      const params = new URLSearchParams({ gradeLevel, term: filter.term, allSubjects: "true" });
      const response = await fetch(`/api/records?${params}`);
      if (!response.ok) throw new Error("Could not load combined performance");
      const data = await response.json() as { students: Student[] };
      setOverallRecords(data.students);
    } catch {
      setMessage("Combined performance could not be loaded. Please try again.");
    } finally {
      setOverallLoading(false);
    }
  }

  function exportOverallCsv() {
    const header = ["Position", "Student", "Student ID", "Class", ...JHS_SUBJECTS, "Total Marks", "Average", "Overall Grade"];
    const rows = overallStudents.map((learner, index) => [index + 1, learner.name, learner.studentCode, learner.className, ...JHS_SUBJECTS.map((subject) => learner.subjectScores[subject] ?? 0), learner.total, learner.average.toFixed(1), gradeFor(learner.average)]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadCsv(csv, `${overallGrade}-${filter.term}-combined-performance.csv`);
  }

  async function exportReportCards() {
    try {
      const params = new URLSearchParams({ className: filter.className, term: filter.term, allSubjects: "true" });
      const response = await fetch(`/api/records?${params}`);
      if (!response.ok) throw new Error("Could not prepare report cards");
      const data = await response.json() as { students: Student[] };
      const learners = new Map<string, { studentCode: string; name: string; results: Map<string, Student> }>();
      for (const record of data.students) {
        const key = record.studentCode;
        if (!learners.has(key)) learners.set(key, { studentCode: record.studentCode, name: record.name, results: new Map() });
        learners.get(key)!.results.set(record.subject, record);
      }
      const subjectColumns = JHS_SUBJECTS.flatMap((subject) => [`${subject} Total`, `${subject} Grade`]);
      const header = ["School", "Class", "Term", "Student ID", "Student", ...subjectColumns, "Subjects Recorded", "Overall Average", "Overall Grade", "Promotion Status"];
      const rows = [...learners.values()].sort((a, b) => a.name.localeCompare(b.name)).map((learner) => {
        const totals: number[] = [];
        const resultCells = JHS_SUBJECTS.flatMap((subject) => {
          const result = learner.results.get(subject);
          if (!result) return ["", ""];
          const total = result.classScore + result.examScore;
          totals.push(total);
          return [total, gradeFor(total)];
        });
        const overallAverage = totals.length ? Math.round(totals.reduce((sum, total) => sum + total, 0) / totals.length) : 0;
        return [SCHOOL_NAME, filter.className, filter.term, learner.studentCode, learner.name, ...resultCells, totals.length, overallAverage, gradeFor(overallAverage), overallAverage >= 50 ? "Promoted" : "Needs support"];
      });
      const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
      downloadCsv(csv, `${SCHOOL_NAME}-${filter.className}-${filter.term}-report-cards.csv`);
      setMessage(`${rows.length} report card${rows.length === 1 ? "" : "s"} exported.`);
    } catch {
      setMessage("Report cards could not be exported. Please try again.");
    }
  }

  async function openReportCard() {
    try {
      const params = new URLSearchParams({ className: filter.className, term: filter.term, allSubjects: "true" });
      const response = await fetch(`/api/records?${params}`);
      if (!response.ok) throw new Error("Could not prepare report card");
      const data = await response.json() as { students: Student[] };
      const codes = [...new Set(data.students.map((record) => record.studentCode))];
      if (!codes.length) {
        setMessage("Add student scores before generating a report card.");
        return;
      }
      setReportRecords(data.students);
      setReportStudentCode(codes[0]);
      setModal("report");
    } catch {
      setMessage("The report card could not be prepared. Please try again.");
    }
  }

  const pageTitle = ({ dashboard: "Class Overview", scorebook: "Assessment Record", administrator: "Administrator", schemes: "Scheme of Work", reports: "Performance Report", overall: "Combined Grade Performance", settings: "Assessment Settings" } as Record<View, string>)[view];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">54</span><span><strong>1954 J.H.S.</strong><small>ClassRecord</small></span></div>
        <nav aria-label="Main navigation">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => item.id === "overall" ? void loadOverallPerformance() : setView(item.id)}>
              <Icon name={item.icon}/><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot"><span className="help-dot">?</span><span>Help & support</span></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="school-dashboard-name">{SCHOOL_NAME}</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="top-actions">
            <label className="searchbox"><Icon name="search" size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." aria-label="Search students"/></label>
            <button className="icon-btn" aria-label="Notifications"><Icon name="bell"/></button>
            <div className="profile"><span className="avatar teacher">IA</span><span><strong>Teacher</strong><small>Assessment manager</small></span></div>
          </div>
        </header>

        {view !== "schemes" && <div className="filters">
          <label><span>Class</span><select value={filter.className} onChange={(e) => setFilter({ ...filter, className: e.target.value })}>{SCHOOL_CLASSES.map((className) => <option key={className}>{className}</option>)}</select></label>
          <label><span>Subject</span><select value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })}>{JHS_SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
          <label><span>Term</span><select value={filter.term} onChange={(e) => setFilter({ ...filter, term: e.target.value })}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select></label>
          {view === "overall" ? <button className="primary" onClick={() => void loadOverallPerformance()}><Icon name="chart" size={19}/>Refresh combined results</button> : view === "administrator" ? <span className="admin-filter-badge">🔒 Administrator controls</span> : <button className="primary" onClick={() => void openScoreEntry()} disabled={scoreEntryPending}><Icon name="edit" size={19}/>{scoreEntryPending ? "Checking access…" : "Enter scores"}</button>}
        </div>}
        {view !== "schemes" && <div className="selected-teacher"><span>Subject teacher</span><strong>{selectedTeacher || "Not assigned"}</strong><small>{filter.subject} · {filter.className}</small></div>}

        {message && <div className="toast" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss"><Icon name="close" size={16}/></button></div>}

        {(view === "scorebook" || view === "dashboard") && <>
          <section className="metrics">
            <article><span className="metric-icon cyan"><Icon name="users" size={29}/></span><div><strong>{students.length}</strong><span>Students</span></div></article>
            <article><span className="metric-icon green"><Icon name="chart" size={29}/></span><div><strong>{average}%</strong><span>Class average</span></div></article>
            <article><span className="metric-icon emerald">✓</span><div><strong>{passRate}%</strong><span>Pass rate</span></div></article>
          </section>
          {view === "dashboard" && <button className="scheme-dashboard-cta" onClick={() => setView("schemes")}><Icon name="book" size={22}/><span><strong>View Scheme of Work</strong><small>Browse approved curriculum documents by level, term and subject.</small></span></button>}
          <ScoreTable students={visible} loading={loading} />
        </>}

        {view === "schemes" && <SchemeOfWork />}

        {view === "administrator" && !adminUnlocked && <section className="admin-lock panel">
          <span className="admin-lock-icon">🔐</span><p className="eyebrow">Restricted area</p><h2>Administrator access required</h2>
          <p>Log in to manage the official student list, subject teachers and subject-teacher passwords.</p>
          <form onSubmit={unlockAdministrator}><label>Password<input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Enter administrator password" autoFocus disabled={adminLoginPending} /></label><button className="primary" type="submit" disabled={adminLoginPending}>{adminLoginPending ? "Signing in…" : "Login as Administrator"}</button></form>
        </section>}

        {view === "administrator" && adminUnlocked && <section className="attendance-layout">
          <div className="attendance-banner"><div><p>Administrator only</p><h2>School Administration</h2><span>Manage the student list, subject teachers and teacher access passwords.</span></div><button className="secondary" onClick={() => { setAdminUnlocked(false); setAdminPassword(""); setAdminSection("students"); }}>Logout administrator</button></div>
          <div className="admin-section-tabs"><button className={adminSection === "students" ? "active" : ""} onClick={() => setAdminSection("students")}><Icon name="users" size={19}/>Student List</button><button className={adminSection === "teachers" ? "active" : ""} onClick={() => setAdminSection("teachers")}><Icon name="users" size={19}/>Subject Teachers</button><button className={adminSection === "passwords" ? "active" : ""} onClick={() => setAdminSection("passwords")}>🔑 Password</button><button className={adminSection === "schemes" ? "active" : ""} onClick={() => setAdminSection("schemes")}><Icon name="book" size={19}/>Scheme of Work</button></div>
          {adminSection === "students" && <>
          <section className="panel roster-tools">
            <div className="panel-head"><div><h2>Add or upload students</h2><p>{filter.className} · The official roster shared by every subject teacher</p></div></div>
            <div className="roster-actions">
              <form onSubmit={addRosterStudent}><label>Student name<input required value={rosterForm.name} onChange={(event) => setRosterForm({ name: event.target.value })} placeholder="Full name"/></label><label>Index number<input value="Generated automatically" readOnly aria-label="Index number generated automatically"/></label><button className="primary" type="submit"><Icon name="plus" size={18}/>Add to all subjects</button></form>
              <div className="upload-box"><Icon name="download" size={28}/><strong>Upload student list</strong><span>Excel/CSV: Student names in column A. Index numbers are generated automatically.</span><label className="secondary">Choose Excel file<input type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadRoster(file); }}/></label></div>
            </div>
          </section>
          <section className="panel attendance-panel">
            <div className="panel-head"><div><h2>Official student list</h2><p>{filter.className} · Index numbers are assigned automatically in ascending order.</p></div></div>
            <div className="table-scroll"><table><thead><tr><th>Index number</th><th>Student</th><th>Class</th><th>Action</th></tr></thead><tbody>{rosterLoading ? <tr><td colSpan={4} className="empty">Loading the official student list…</td></tr> : roster.length === 0 ? <tr><td colSpan={4} className="empty">No students have been added to {filter.className} yet.</td></tr> : roster.map((student, index) => <tr key={student.id}><td><strong>{student.studentCode}</strong></td><td><span className={`avatar small tone-${index % 5}`}>{initials(student.name)}</span><span><strong>{student.name}</strong></span></td><td>{student.className}</td><td><button className="danger-icon" onClick={() => void removeRosterStudent(student)} aria-label={`Remove ${student.name}`}><Icon name="trash" size={17}/></button></td></tr>)}</tbody></table></div>
            <div className="attendance-save"><span>{roster.length} student{roster.length === 1 ? "" : "s"} in the official list</span><strong>Next index: {nextRosterIndex(roster)}</strong></div>
          </section>
          </>}
          {adminSection === "teachers" && <section className="teacher-admin-grid">
            <section className="panel teacher-assignment">
              <div className="panel-head"><div><h2>Assign subject teacher</h2><p>Select a class and subject, then enter the responsible teacher&apos;s name.</p></div></div>
              <form onSubmit={saveSubjectTeacher}>
                <label>Class<select value={teacherForm.className} onChange={(event) => setTeacherForm({ ...teacherForm, className: event.target.value })}>{SCHOOL_CLASSES.map((className) => <option key={className}>{className}</option>)}</select></label>
                <label>Subject<select value={teacherForm.subject} onChange={(event) => setTeacherForm({ ...teacherForm, subject: event.target.value })}>{JHS_SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
                <label>Teacher name<input required value={teacherForm.teacherName} onChange={(event) => setTeacherForm({ ...teacherForm, teacherName: event.target.value })} placeholder="Enter the teacher's full name"/></label>
                <button className="primary" type="submit">Save teacher assignment</button>
              </form>
            </section>
            <section className="panel teacher-directory">
              <div className="panel-head"><div><h2>Subject teacher directory</h2><p>{teacherAssignments.length} class–subject assignment{teacherAssignments.length === 1 ? "" : "s"} saved</p></div></div>
              <div>{teacherAssignments.length === 0 ? <p className="empty-passwords">No subject teachers have been assigned yet.</p> : teacherAssignments.map((item) => <article key={`${item.className}-${item.subject}`}><span className="avatar small">{initials(item.teacherName)}</span><div><strong>{item.teacherName}</strong><small>{item.subject} · {item.className}</small></div></article>)}</div>
            </section>
          </section>}
          {adminSection === "passwords" && <section className="password-admin-grid">
            <section className="panel password-assignment">
              <div className="panel-head"><div><h2>Assign subject password</h2><p>Create a separate score-entry password for each class and subject.</p></div></div>
              <div className="authentication-toggle">
                <div><span className={authenticationOn ? "auth-indicator on" : "auth-indicator off"}>{authenticationOn ? "ON" : "OFF"}</span><strong>Password authentication</strong><small>{authenticationOn ? "Teachers must enter the assigned subject password." : "Teachers can enter scores without a password."}</small></div>
                <button type="button" role="switch" aria-checked={authenticationOn} className={authenticationOn ? "toggle-switch on" : "toggle-switch"} onClick={() => void toggleAuthentication()}><i/></button>
              </div>
              <form onSubmit={saveSubjectPassword}>
                <label>Class<select value={passwordForm.className} onChange={(event) => setPasswordForm({ ...passwordForm, className: event.target.value })}>{SCHOOL_CLASSES.map((className) => <option key={className}>{className}</option>)}</select></label>
                <label>Subject<select value={passwordForm.subject} onChange={(event) => setPasswordForm({ ...passwordForm, subject: event.target.value })}>{JHS_SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
                <label>Teacher password<input type="password" required minLength={4} value={passwordForm.password} onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })} placeholder="Enter a password for this teacher"/></label>
                <button className="primary" type="submit">Save subject password</button>
              </form>
              <p className="security-note">Passwords are stored securely. Assign different passwords where possible and share each one only with the responsible subject teacher.</p>
            </section>
            <section className="panel configured-passwords">
              <div className="panel-head"><div><h2>Configured access</h2><p>{configuredPasswords.length} class–subject password{configuredPasswords.length === 1 ? "" : "s"} assigned</p></div></div>
              <div>{configuredPasswords.length === 0 ? <p className="empty-passwords">No subject passwords have been assigned yet.</p> : configuredPasswords.map((item) => <article key={`${item.className}-${item.subject}`}><span>✓</span><div><strong>{item.subject}</strong><small>{item.className}</small></div><em>Protected</em></article>)}</div>
            </section>
          </section>}
          {adminSection === "schemes" && <SchemeOfWork administrator adminPassword={adminPassword} />}
        </section>}

        {view === "reports" && <section className="report-layout">
          <article className="report-hero"><p>Class performance</p><strong>{average}%</strong><span>Overall mean score</span><div className="progress"><i style={{ width: `${average}%` }}/></div></article>
          <article className="panel report-card"><div className="panel-head"><div><h2>Performance summary</h2><p>{SCHOOL_NAME} · {filter.subject} · {filter.className}</p></div><div className="export-actions"><button className="secondary" onClick={exportCsv}><Icon name="download" size={18}/>Score sheet CSV</button><button className="secondary" onClick={() => void exportReportCards()}><Icon name="download" size={18}/>Report cards CSV</button><button className="primary compact" onClick={() => void openReportCard()}><Icon name="book" size={18}/>Printable report card</button><button className="primary compact" onClick={() => void loadOverallPerformance(filter.className.slice(0, 7))}><Icon name="chart" size={18}/>View combined Red + Blue</button></div></div>
            <div className="report-stats"><div><span>Highest score</span><strong>{highest}%</strong></div><div><span>Students passed</span><strong>{passed}</strong></div><div><span>Needs support</span><strong>{students.length - passed}</strong></div><div><span>Total learners</span><strong>{students.length}</strong></div></div>
            <h3>Grade distribution</h3>
            <div className="grade-bars">{["A","B","C","D","F"].map((grade) => { const count = students.filter((s) => gradeFor(s.classScore + s.examScore) === grade).length; return <div key={grade}><b>{grade}</b><span><i style={{ width: `${students.length ? (count / students.length) * 100 : 0}%` }}/></span><em>{count}</em></div> })}</div>
          </article>
        </section>}

        {view === "overall" && <section className="overall-layout">
          <div className="overall-banner">
            <div><p>Red + Blue streams combined</p><h2>{overallGrade} Overall Performance</h2><span>{filter.term} · Rankings use each learner&apos;s average across all recorded subjects.</span></div>
            <div className="grade-switcher">{GRADE_LEVELS.map((grade) => <button key={grade} className={overallGrade === grade ? "active" : ""} onClick={() => void loadOverallPerformance(grade)}>{grade}</button>)}</div>
          </div>
          <section className="metrics overall-metrics">
            <article><span className="metric-icon cyan"><Icon name="users" size={29}/></span><div><strong>{overallStudents.length}</strong><span>Combined learners</span></div></article>
            <article><span className="metric-icon green"><Icon name="chart" size={29}/></span><div><strong>{overallStudents.length ? Math.round(overallStudents.reduce((sum, learner) => sum + learner.average, 0) / overallStudents.length) : 0}%</strong><span>Overall average</span></div></article>
            <article><span className="metric-icon emerald">✓</span><div><strong>{overallStudents.length ? Math.round((overallStudents.filter((learner) => learner.average >= 50).length / overallStudents.length) * 100) : 0}%</strong><span>Combined pass rate</span></div></article>
          </section>
          <section className="panel overall-panel">
            <div className="panel-head"><div><h2>Overall student performance</h2><p>{overallGrade} Red and Blue ranked together across all JHS subjects</p></div><button className="secondary" onClick={exportOverallCsv} disabled={!overallStudents.length}><Icon name="download" size={18}/>Export combined CSV</button></div>
            <div className="table-scroll student-performance-scroll"><table className="student-performance-matrix"><thead><tr><th>Position</th><th>Student</th><th>Class</th>{JHS_SUBJECTS.map((subject) => <th key={subject}>{subject}</th>)}<th>Total</th><th>Average</th><th>Grade</th></tr></thead><tbody>{overallLoading ? <tr><td colSpan={16} className="empty">Combining performance records…</td></tr> : overallStudents.length === 0 ? <tr><td colSpan={16} className="empty">No students have recorded scores for {overallGrade} Red or Blue in {filter.term}.</td></tr> : overallStudents.map((learner, index) => <tr key={`${learner.className}-${learner.studentCode}`}><td><span className={`position-badge position-${index + 1}`}>{index + 1}</span></td><td><strong>{learner.name}</strong><small>{learner.studentCode}</small></td><td><span className={learner.className.endsWith("Red") ? "stream red" : "stream blue"}>{learner.className}</span></td>{JHS_SUBJECTS.map((subject) => { const score = learner.subjectScores[subject] ?? 0; return <td key={subject}><span className={score >= 50 ? "subject-score pass" : "subject-score low"}>{score}</span></td> })}<td><b>{learner.total} / 1000</b></td><td><b>{learner.average.toFixed(1)}%</b></td><td><span className={`grade grade-${gradeFor(learner.average).toLowerCase()}`}>{gradeFor(learner.average)}</span></td></tr>)}</tbody></table></div>
          </section>
          <section className="panel overall-panel">
            <div className="panel-head"><div><h2>Overall subject performance</h2><p>All JHS subjects across both {overallGrade} classrooms</p></div></div>
            <div className="table-scroll"><table><thead><tr><th>Subject</th><th>Learners</th><th>Average</th><th>Highest</th><th>Pass rate</th></tr></thead><tbody>{subjectPerformance.map((subject) => <tr key={subject.subject}><td><strong>{subject.subject}</strong></td><td>{subject.learners || "—"}</td><td><b>{subject.learners ? `${subject.average}%` : "—"}</b></td><td>{subject.learners ? `${subject.highest}%` : "—"}</td><td><div className="subject-rate"><span><i style={{ width: `${subject.passRate}%` }}/></span><b>{subject.learners ? `${subject.passRate}%` : "—"}</b></div></td></tr>)}</tbody></table></div>
          </section>
        </section>}

        {view === "settings" && <section className="panel settings-panel"><div className="panel-head"><div><h2>Assessment structure</h2><p>Current scoring and grading rules.</p></div></div><div className="setting-row"><div><strong>Class assessment</strong><span>Exercises, projects and class tests</span></div><b>30 marks</b></div><div className="setting-row"><div><strong>End-of-term examination</strong><span>Final examination score</span></div><b>70 marks</b></div><div className="setting-row"><div><strong>Pass mark</strong><span>Scores below this mark need support</span></div><b>50%</b></div><div className="grade-key"><span>A · 80–100</span><span>B · 70–79</span><span>C · 60–69</span><span>D · 50–59</span><span>F · Below 50</span></div></section>}
      </section>

      {modal === "subjectLogin" && <div className="modal-backdrop"><div className="modal subject-login-modal" role="dialog" aria-modal="true" aria-labelledby="subject-login-title"><div className="modal-head"><div><p className="eyebrow">Teacher verification</p><h2 id="subject-login-title">Unlock score entry</h2></div><button onClick={() => setModal(null)} aria-label="Close"><Icon name="close"/></button></div><div className="subject-access-target"><span>🔒</span><div><strong>{filter.subject}</strong><small>{filter.className} · {filter.term}</small></div></div><p className="modal-note">Enter the password assigned by the administrator for this exact class and subject.</p><form onSubmit={unlockSubject}><label>Subject password<input type="password" required value={subjectPassword} onChange={(event) => setSubjectPassword(event.target.value)} placeholder="Enter assigned password" autoFocus /></label><div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button className="primary" type="submit">Unlock score entry</button></div></form></div></div>}

      {modal === "scores" && <div className="modal-backdrop"><div className="modal wide" role="dialog" aria-modal="true" aria-labelledby="scores-title"><div className="modal-head"><div><p className="eyebrow">{filter.className} · {filter.subject}</p><h2 id="scores-title">Enter scores</h2></div><button onClick={() => setModal(null)} aria-label="Close"><Icon name="close"/></button></div><p className="modal-note">Scores save automatically when you leave a field.</p><div className="score-entry-list">{students.map((s) => <div key={s.id}><span className="avatar small">{initials(s.name)}</span><label><strong>{s.name}</strong><small>{s.studentCode}</small></label><input aria-label={`${s.name} class score`} type="number" min="0" max="30" defaultValue={s.classScore} onBlur={(e) => void updateScores(s, Number(e.target.value), s.examScore)}/><span>/30</span><input aria-label={`${s.name} exam score`} type="number" min="0" max="70" defaultValue={s.examScore} onBlur={(e) => void updateScores(s, s.classScore, Number(e.target.value))}/><span>/70</span></div>)}</div><div className="modal-actions"><button className="secondary" onClick={() => { setModal(null); void loadStudents(); }}>Done</button></div></div></div>}

      {modal === "report" && <ReportCard records={reportRecords} studentCode={reportStudentCode} onStudentChange={setReportStudentCode} filter={filter} details={reportDetails} onDetailsChange={setReportDetails} onClose={() => setModal(null)} />}
    </main>
  );
}

function ReportCard({ records, studentCode, onStudentChange, filter, details, onDetailsChange, onClose }: {
  records: Student[];
  studentCode: string;
  onStudentChange: (code: string) => void;
  filter: { className: string; subject: string; term: string };
  details: ReportDetails;
  onDetailsChange: (details: ReportDetails) => void;
  onClose: () => void;
}) {
  const learners = [...new Map(records.map((record) => [record.studentCode, record])).values()].sort((a, b) => a.name.localeCompare(b.name));
  const learner = learners.find((item) => item.studentCode === studentCode) ?? learners[0];
  const learnerRecords = JHS_SUBJECTS.map((subject) => records.find((record) => record.studentCode === learner?.studentCode && record.subject === subject)).filter(Boolean) as Student[];
  const totalMarks = learnerRecords.reduce((sum, record) => sum + record.classScore + record.examScore, 0);
  const averageScore = learnerRecords.length ? Math.round(totalMarks / learnerRecords.length) : 0;
  const learnerAverages = learners.map((item) => {
    const itemRecords = records.filter((record) => record.studentCode === item.studentCode && JHS_SUBJECTS.includes(record.subject as typeof JHS_SUBJECTS[number]));
    return { code: item.studentCode, average: itemRecords.length ? itemRecords.reduce((sum, record) => sum + record.classScore + record.examScore, 0) / itemRecords.length : 0 };
  }).sort((a, b) => b.average - a.average);
  const classPosition = learnerAverages.findIndex((item) => item.code === learner?.studentCode) + 1;
  const daysAbsent = Math.max(0, details.daysOpened - details.daysPresent);
  const generatedDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());

  function update<K extends keyof ReportDetails>(key: K, value: ReportDetails[K]) {
    onDetailsChange({ ...details, [key]: value });
  }

  function positionFor(record: Student) {
    const ranked = records.filter((item) => item.subject === record.subject).sort((a, b) => (b.classScore + b.examScore) - (a.classScore + a.examScore));
    return ranked.findIndex((item) => item.studentCode === record.studentCode) + 1;
  }

  function remarkFor(total: number) {
    if (total >= 80) return "Excellent";
    if (total >= 70) return "Very good";
    if (total >= 60) return "Good";
    if (total >= 50) return "Satisfactory";
    return "Needs improvement";
  }

  const ratingOptions = ["Excellent", "Very Good", "Good", "Needs Improvement"];

  return <div className="report-modal-backdrop">
    <div className="report-toolbar no-print">
      <label>Select student<select value={learner?.studentCode ?? ""} onChange={(event) => onStudentChange(event.target.value)}>{learners.map((item) => <option key={item.studentCode} value={item.studentCode}>{item.name} · {item.studentCode}</option>)}</select></label>
      <button className="secondary" onClick={onClose}><Icon name="close" size={17}/>Close</button>
      <button className="primary" onClick={() => window.print()}><Icon name="download" size={17}/>Print / Save PDF</button>
    </div>
    <article className="student-report-card" aria-label="Student report card">
      <header className="report-card-header">
        <img className="report-card-logo" src="/ghana-coat-of-arms.png" alt="Ghana coat of arms" />
        <div className="report-school-identity">
          <h2>{SCHOOL_NAME}</h2>
          <div className="school-contact"><input aria-label="School address" value={details.address} onChange={(event) => update("address", event.target.value)} /></div>
          <div className="school-contact"><span>Tel:</span><input aria-label="School contact details" value={details.contact} onChange={(event) => update("contact", event.target.value)} /></div>
          <p>LORD INCREASE ME IN KNOWLEDGE.</p>
        </div>
        <img className="report-card-logo school-report-logo" src="/school-logo.png" alt="1st November 1954 JHS school crest" />
      </header>
      <div className="ghana-header-stripe" aria-hidden="true" />

      <div className="report-heading-row">
        <h3 className="report-title">Student Report Card</h3>
        <div className="report-period"><label>Academic year<input value={details.academicYear} onChange={(event) => update("academicYear", event.target.value)} /></label><label>Term<strong>{filter.term}</strong></label></div>
      </div>

      <h4 className="floating-section-title student-title">Student Information</h4>
      <section className="report-info-grid">
        <label><span>Student name</span><strong>{learner?.name ?? "—"}</strong></label>
        <label><span>Student ID / Index no.</span><strong>{learner?.studentCode ?? "—"}</strong></label>
        <label><span>Gender</span><select value={details.gender} onChange={(event) => update("gender", event.target.value)}><option value="">—</option><option>Male</option><option>Female</option></select></label>
        <label><span>Class / Grade / Programme</span><strong>{filter.className} · JHS</strong></label>
      </section>

      <section className="report-section academic-section">
        <h4>Academic Performance</h4>
        <table className="report-performance-table"><thead><tr><th>Subject</th><th>Class Score<br/>(30%)</th><th>Exam Score<br/>(70%)</th><th>Total<br/>(100%)</th><th>Grade</th><th>Position</th><th>Teacher&apos;s Remarks</th></tr></thead>
          <tbody>{JHS_SUBJECTS.map((subject) => {
            const record = records.find((item) => item.studentCode === learner?.studentCode && item.subject === subject);
            const total = record ? record.classScore + record.examScore : null;
            const grade = total === null ? null : gradeFor(total);
            return <tr key={subject}><td>{subject}</td><td>{record?.classScore ?? "—"}</td><td>{record?.examScore ?? "—"}</td><td>{total ?? "—"}</td><td>{grade ? <span className={`report-grade report-grade-${grade.toLowerCase()}`}>{grade}</span> : "—"}</td><td>{record ? positionFor(record) : "—"}</td><td>{total === null ? "Not recorded" : remarkFor(total)}</td></tr>;
          })}</tbody>
        </table>
      </section>

      <div className="report-dashboard">
        <section className="report-section report-summary"><h4>Performance Summary</h4><div><label>Total marks obtained<strong>{totalMarks} / {learnerRecords.length * 100}</strong></label><label className="summary-highlight">Average score<strong>{averageScore}%</strong></label><label>Overall grade<strong className={`summary-grade report-grade-${gradeFor(averageScore).toLowerCase()}`}>{gradeFor(averageScore)}</strong></label><label>Class position<strong>{classPosition || "—"} of {learners.length}</strong></label><label>Total students<strong>{learners.length}</strong></label></div></section>
        <section className="report-section attendance-section"><h4>Attendance Record</h4><table className="compact-report-table"><tbody><tr><td>Days school opened</td><td><input type="number" min="0" value={details.daysOpened} onChange={(event) => update("daysOpened", Number(event.target.value))}/></td></tr><tr><td>Days present</td><td><input type="number" min="0" max={details.daysOpened} value={details.daysPresent} onChange={(event) => update("daysPresent", Number(event.target.value))}/></td></tr><tr><td>Days absent</td><td><strong>{daysAbsent}</strong></td></tr></tbody></table></section>
        <section className="report-section conduct-section"><h4>Conduct &amp; Skills Assessment</h4><div className="conduct-grid">{([
          ["Behaviour", "behaviour"], ["Punctuality", "punctuality"], ["Attitude to learning", "attitude"], ["Class participation", "participation"],
        ] as [string, keyof ReportDetails][]).map(([label, key]) => <label key={key}><span>{label}</span><select value={String(details[key])} onChange={(event) => update(key, event.target.value as never)}>{ratingOptions.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div></section>
      </div>

      <div className="report-lower">
        <section className="report-section grading-section"><h4>Grading Scale</h4><table className="compact-report-table"><tbody><tr><td><b>A</b></td><td>80–100</td><td>Excellent</td></tr><tr><td><b>B</b></td><td>70–79</td><td>Very Good</td></tr><tr><td><b>C</b></td><td>60–69</td><td>Good</td></tr><tr><td><b>D</b></td><td>50–59</td><td>Satisfactory</td></tr><tr><td><b>F</b></td><td>0–49</td><td>Needs Improvement</td></tr></tbody></table></section>
        <section className="report-section comments-section"><h4>Comments &amp; Remarks</h4><div><label>Class teacher&apos;s comment<textarea value={details.teacherComment} onChange={(event) => update("teacherComment", event.target.value)} placeholder="Enter the class teacher's comment"/><span className="print-comment">{details.teacherComment || "—"}</span></label><label>Headteacher&apos;s comment<textarea value={details.headteacherComment} onChange={(event) => update("headteacherComment", event.target.value)} placeholder="Enter the headteacher's comment"/><span className="print-comment">{details.headteacherComment || "—"}</span></label></div></section>
      </div>

      <section className="signature-grid" aria-label="Report approval signatures"><div><label>Class teacher&apos;s name<input value={details.classTeacherName} onChange={(event) => update("classTeacherName", event.target.value)} placeholder="Name" /></label><span>Class teacher&apos;s signature</span><span>Date</span></div><div><label>Headteacher&apos;s name<input value={details.headteacherName} onChange={(event) => update("headteacherName", event.target.value)} placeholder="Name" /></label><span>Headteacher&apos;s signature</span><span>Official stamp</span><span>Date</span></div></section>
      <footer className="report-card-footer"><span>Lord Increase Me in Knowledge</span><span>Generated {generatedDate}</span><span>Page 1</span></footer>
    </article>
  </div>;
}

function ScoreTable({ students, loading }: { students: Student[]; loading: boolean }) {
  return <section className="score-panel"><div className="panel-head"><div><h2>Student scores</h2><p>Official roster managed through Student List</p></div><span className="record-count">{students.length} records</span></div><div className="table-scroll"><table><thead><tr><th>Student</th><th>Class Score <small>(30)</small></th><th>Exam Score <small>(70)</small></th><th>Total <small>(100)</small></th><th>Grade</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="empty">Loading records…</td></tr> : students.length === 0 ? <tr><td colSpan={6} className="empty">No students are in the official roster for this class.</td></tr> : students.map((s, index) => { const total = s.classScore + s.examScore; return <tr key={s.id}><td><span className={`avatar small tone-${index % 5}`}>{initials(s.name)}</span><span><strong>{s.name}</strong><small>{s.studentCode}</small></span></td><td>{s.classScore}</td><td>{s.examScore}</td><td><b>{total}%</b></td><td><span className={`grade grade-${gradeFor(total).toLowerCase()}`}>{gradeFor(total)}</span></td><td><span className={total >= 50 ? "status passed" : "status support"}><i/>{total >= 50 ? "Passed" : "Needs support"}</span></td></tr> })}</tbody></table></div></section>;
}
