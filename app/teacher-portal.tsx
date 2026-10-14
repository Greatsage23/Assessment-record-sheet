"use client";

import { FormEvent, useEffect, useState } from "react";
import Exercise from "./exercise";
import Exam from "./exam";

type Assignment = { className: string; subject: string; teacherName: string };

export default function TeacherPortal({ academicYear, term, onOpenLessonNotes, onMigrated }: { academicYear: string; term: string; onOpenLessonNotes: () => void; onMigrated: (className: string, subject: string) => void }) {
  const [teachers, setTeachers] = useState<string[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentKey, setAssignmentKey] = useState("");
  const [password, setPassword] = useState("");
  const [authenticationOn, setAuthenticationOn] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [section, setSection] = useState<"home" | "exercise" | "exam">("home");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPortal(name = "") {
    setLoading(true);
    try {
      const query = new URLSearchParams({ mode: "portal" });
      if (name) query.set("teacherName", name);
      const response = await fetch(`/api/teachers?${query}`);
      const data = await response.json() as { teachers?: string[]; assignments?: Assignment[]; authenticationOn?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to load teacher access.");
      setTeachers(data.teachers ?? []); setAssignments(data.assignments ?? []); setAuthenticationOn(Boolean(data.authenticationOn));
      setAssignmentKey(data.assignments?.[0] ? `${data.assignments[0].className}|||${data.assignments[0].subject}` : "");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load teacher access."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadPortal(); }, []);
  const [className = "", subject = ""] = assignmentKey.split("|||");

  async function login(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      if (!teacherName || !className || !subject) throw new Error("Select your name and an assigned subject.");
      const response = await fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "subject-login", className, subject, subjectPassword: password }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Teacher access could not be verified.");
      setUnlocked(true); setSection("home");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Teacher access could not be verified."); }
    finally { setLoading(false); }
  }

  function logout() { setUnlocked(false); setSection("home"); setPassword(""); setMessage(""); }

  if (!unlocked) return <section className="teacher-portal-login"><div className="teacher-login-hero"><div><p>Teacher workspace</p><h2>Open your assigned academic tools</h2><span>Select your name and assigned subject. Password verification follows the Administrator&apos;s authentication setting.</span></div><span>👩🏽‍🏫</span></div><form className="panel teacher-access-form" onSubmit={login}><label>Teacher name<select required value={teacherName} onChange={(event) => { const name = event.target.value; setTeacherName(name); setUnlocked(false); void loadPortal(name); }}><option value="">Select your name</option>{teachers.map((teacher) => <option key={teacher}>{teacher}</option>)}</select></label><label>Assigned class and subject<select required value={assignmentKey} onChange={(event) => setAssignmentKey(event.target.value)} disabled={!assignments.length}><option value="">{teacherName ? "Select assignment" : "Select your name first"}</option>{assignments.map((item) => <option key={`${item.className}-${item.subject}`} value={`${item.className}|||${item.subject}`}>{item.className} · {item.subject}</option>)}</select></label>{authenticationOn && <label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter assigned password"/><small>If no password was assigned, use the default password 0000.</small></label>}<button className="primary" disabled={loading || !assignmentKey}>{loading ? "Checking…" : "Open Teacher Dashboard"}</button></form>{message && <div className="review-message">{message}</div>}{teacherName && !assignments.length && !loading && <div className="teacher-no-assignment">No class or subject has been assigned to this teacher. Contact the headteacher.</div>}</section>;

  return <section className="teacher-portal"><div className="teacher-portal-banner"><div><p>Authenticated teacher</p><h2>{teacherName}</h2><span>{subject} · {className} · {academicYear} · {term}</span></div><button className="secondary" onClick={logout}>Logout</button></div><nav className="teacher-tool-tabs"><button className={section === "home" ? "active" : ""} onClick={() => setSection("home")}>Overview</button><button className={section === "exercise" ? "active" : ""} onClick={() => setSection("exercise")}>Exercise</button><button className={section === "exam" ? "active" : ""} onClick={() => setSection("exam")}>Exam</button><button onClick={onOpenLessonNotes}>Lesson Notes</button></nav>{section === "home" && <div className="teacher-tool-grid"><button onClick={() => setSection("exercise")}><span>30%</span><strong>Exercise</strong><small>Record exercises, homework and class tests.</small></button><button onClick={() => setSection("exam")}><span>70%</span><strong>Exam</strong><small>Record examination marks and migrate them.</small></button><button onClick={onOpenLessonNotes}><span>NOTE</span><strong>Lesson Notes</strong><small>Prepare, edit and submit weekly lesson notes.</small></button></div>}{section === "exercise" && <Exercise key={`exercise-${assignmentKey}`} academicYear={academicYear} term={term} lockedClassName={className} lockedSubject={subject} accessPassword={password} portalAccess onMigrated={onMigrated}/>} {section === "exam" && <Exam key={`exam-${assignmentKey}`} academicYear={academicYear} term={term} lockedClassName={className} lockedSubject={subject} accessPassword={password} portalAccess onMigrated={onMigrated}/>}</section>;
}
