import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  const token = params.token;
  if (!token || !/^[\w-]{20,}$/.test(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: downloads, error } = await supabaseAdmin
    .from("downloads")
    .select("product_file_id, expires_at")
    .eq("download_token", token)
    .limit(1);

  if (error || !downloads || downloads.length === 0) {
    return NextResponse.json(
      { error: "Invalid or expired download token" },
      { status: 404 },
    );
  }

  const download = downloads[0];
  const expiresAt = new Date(download.expires_at);
  if (expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Download link expired" },
      { status: 410 },
    );
  }

  const { data: files, error: fileError } = await supabaseAdmin
    .from("product_files")
    .select("file_name, file_url")
    .eq("id", download.product_file_id)
    .limit(1);

  if (fileError || !files || files.length === 0) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const file = files[0];
  let fileResponse: Response;
  try {
    if (file.file_url.startsWith("http")) {
      fileResponse = await fetch(file.file_url);
    } else {
      const bucketId = process.env.SUPABASE_STORAGE_BUCKET || "product-files";
      const { data, error: downloadError } = await supabaseAdmin.storage
        .from(bucketId)
        .download(file.file_url);
      if (downloadError || !data) {
        throw new Error("Storage download failed");
      }
      fileResponse = new Response(data, { status: 200 });
    }
  } catch (err) {
    console.error("File download error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve file" },
      { status: 500 },
    );
  }

  const fileName = file.file_name || "download";
  const res = new NextResponse(fileResponse.body, { status: 200 });
  res.headers.set(
    "Content-Type",
    fileResponse.headers.get("Content-Type") || "application/octet-stream",
  );
  res.headers.set("Content-Disposition", `attachment; filename="${fileName}"`);

  try {
    await supabaseAdmin.from("download_logs").insert({
      token,
      file_id: download.product_file_id,
      ip: request.headers.get("x-forwarded-for") || request.ip || "",
      user_agent: request.headers.get("user-agent") || "",
    });
  } catch (e) {
    console.error("download log failed", e);
  }
  return res;
}
