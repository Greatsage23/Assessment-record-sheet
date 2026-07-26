import { ensureDatabase, getSql } from "../../../db";

const ADMIN_PASSWORD = "administrator";
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_FILES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword", "application/octet-stream"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"],
  xls: ["application/vnd.ms-excel", "application/octet-stream"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"],
};
const LEVELS = new Set(["Basic 7", "Basic 8", "Basic 9"]);
const TERMS = new Set(["Term 1", "Term 2", "Term 3"]);

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function safeFilename(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const base = filename.slice(0, Math.max(0, filename.length - extension.length - 1))
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100) || "scheme-of-work";
  return `${base}.${extension}`;
}

function validateScope(academicYear: string, term: string, level: string, subject: string, title: string) {
  if (!academicYear || !/^\d{4}\/\d{4}$/.test(academicYear)) return "Use an academic year in the format 2026/2027.";
  if (!TERMS.has(term)) return "Select a valid term.";
  if (!LEVELS.has(level)) return "Select a valid level.";
  if (!subject || subject.length > 100) return "Select a valid subject.";
  if (!title || title.length > 180) return "Enter a title or description up to 180 characters.";
  return null;
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const sql = await getSql();
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
    const academicYear = url.searchParams.get("academicYear") ?? "";
    const term = url.searchParams.get("term") ?? "";
    const level = url.searchParams.get("level") ?? "";
    const subject = url.searchParams.get("subject") ?? "";
    const rows = await sql`SELECT id, title, subject, level, term, academic_year, file_name,
      file_type, mime_type, file_size, uploaded_by, created_at, updated_at
      FROM schemes_of_work ORDER BY updated_at DESC`;
    const schemes = rows.filter((row) => {
      const matchesSearch = !search || String(row.title).toLowerCase().includes(search) || String(row.subject).toLowerCase().includes(search);
      return matchesSearch && (!academicYear || row.academic_year === academicYear) && (!term || row.term === term) && (!level || row.level === level) && (!subject || row.subject === subject);
    }).map((row) => ({
      id: row.id, title: row.title, subject: row.subject, level: row.level, term: row.term,
      academicYear: row.academic_year, fileName: row.file_name, fileType: row.file_type,
      mimeType: row.mime_type, fileSize: row.file_size, uploadedBy: row.uploaded_by,
      createdAt: row.created_at, updatedAt: row.updated_at,
    }));
    return Response.json({ schemes });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load schemes of work." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const form = await request.formData();
    if (clean(form.get("adminPassword")) !== ADMIN_PASSWORD) return Response.json({ error: "Administrator access is required." }, { status: 401 });
    const academicYear = clean(form.get("academicYear"));
    const term = clean(form.get("term"));
    const level = clean(form.get("level"));
    const subject = clean(form.get("subject"));
    const title = clean(form.get("title"));
    const replaceId = Number(clean(form.get("replaceId"))) || null;
    const scopeError = validateScope(academicYear, term, level, subject, title);
    if (scopeError) return Response.json({ error: scopeError }, { status: 400 });

    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return Response.json({ error: "Choose a document to upload." }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return Response.json({ error: "The document must be 3 MB or smaller." }, { status: 413 });
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_FILES[extension] || !ALLOWED_FILES[extension].includes(file.type || "application/octet-stream")) {
      return Response.json({ error: "Only PDF, DOC, DOCX, XLS and XLSX documents are supported." }, { status: 415 });
    }

    const sql = await getSql();
    const duplicates = await sql`SELECT id FROM schemes_of_work WHERE academic_year = ${academicYear}
      AND term = ${term} AND level = ${level} AND subject = ${subject} LIMIT 1`;
    const duplicateId = duplicates.length ? Number(duplicates[0].id) : null;
    if (duplicateId && duplicateId !== replaceId) {
      return Response.json({ error: "A scheme already exists for this academic year, term, level and subject.", duplicateId }, { status: 409 });
    }

    const fileName = safeFilename(file.name);
    const fileData = Buffer.from(await file.arrayBuffer()).toString("base64");
    if (replaceId) {
      const updated = await sql`UPDATE schemes_of_work SET title = ${title}, subject = ${subject}, level = ${level},
        term = ${term}, academic_year = ${academicYear}, file_name = ${fileName}, file_type = ${extension.toUpperCase()},
        mime_type = ${file.type || ALLOWED_FILES[extension][0]}, file_size = ${file.size}, file_data = ${fileData},
        uploaded_by = 'Administrator', updated_at = CURRENT_TIMESTAMP WHERE id = ${replaceId} RETURNING id`;
      if (!updated.length) return Response.json({ error: "The scheme to replace was not found." }, { status: 404 });
      return Response.json({ ok: true, id: updated[0].id, replaced: true });
    }

    const inserted = await sql`INSERT INTO schemes_of_work (title, subject, level, term, academic_year, file_name,
      file_type, mime_type, file_size, file_data, uploaded_by) VALUES (${title}, ${subject}, ${level}, ${term},
      ${academicYear}, ${fileName}, ${extension.toUpperCase()}, ${file.type || ALLOWED_FILES[extension][0]},
      ${file.size}, ${fileData}, 'Administrator') RETURNING id`;
    return Response.json({ ok: true, id: inserted[0].id, replaced: false }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload the scheme of work.";
    return Response.json({ error: message.includes("scheme_work_scope_idx") ? "A scheme already exists for this selection." : message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as { id?: number; adminPassword?: string; title?: string; subject?: string; level?: string; term?: string; academicYear?: string };
    if (payload.adminPassword !== ADMIN_PASSWORD) return Response.json({ error: "Administrator access is required." }, { status: 401 });
    if (!payload.id) return Response.json({ error: "A scheme record is required." }, { status: 400 });
    const title = payload.title?.trim() ?? "";
    const subject = payload.subject?.trim() ?? "";
    const level = payload.level?.trim() ?? "";
    const term = payload.term?.trim() ?? "";
    const academicYear = payload.academicYear?.trim() ?? "";
    const scopeError = validateScope(academicYear, term, level, subject, title);
    if (scopeError) return Response.json({ error: scopeError }, { status: 400 });
    const sql = await getSql();
    const updated = await sql`UPDATE schemes_of_work SET title = ${title}, subject = ${subject}, level = ${level},
      term = ${term}, academic_year = ${academicYear}, updated_at = CURRENT_TIMESTAMP WHERE id = ${payload.id} RETURNING id`;
    if (!updated.length) return Response.json({ error: "Scheme not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update scheme information.";
    return Response.json({ error: message.includes("scheme_work_scope_idx") ? "Another scheme already uses this level, subject, year and term." : message }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as { id?: number; adminPassword?: string };
    if (payload.adminPassword !== ADMIN_PASSWORD) return Response.json({ error: "Administrator access is required." }, { status: 401 });
    if (!payload.id) return Response.json({ error: "A scheme record is required." }, { status: 400 });
    const sql = await getSql();
    const removed = await sql`DELETE FROM schemes_of_work WHERE id = ${payload.id} RETURNING id`;
    if (!removed.length) return Response.json({ error: "Scheme not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete the scheme." }, { status: 500 });
  }
}
