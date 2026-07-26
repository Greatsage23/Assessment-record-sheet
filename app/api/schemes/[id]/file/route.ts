import { ensureDatabase, getSql } from "../../../../../db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabase();
    const { id } = await context.params;
    const schemeId = Number(id);
    if (!Number.isInteger(schemeId)) return Response.json({ error: "Invalid scheme." }, { status: 400 });
    const sql = await getSql();
    const rows = await sql`SELECT file_name, mime_type, file_data FROM schemes_of_work WHERE id = ${schemeId} LIMIT 1`;
    if (!rows.length) return Response.json({ error: "Scheme not found." }, { status: 404 });
    const row = rows[0];
    const download = new URL(request.url).searchParams.get("download") === "1";
    const filename = String(row.file_name).replace(/["\r\n]/g, "_");
    return new Response(Buffer.from(String(row.file_data), "base64"), {
      headers: {
        "Content-Type": String(row.mime_type),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to open the scheme." }, { status: 500 });
  }
}
