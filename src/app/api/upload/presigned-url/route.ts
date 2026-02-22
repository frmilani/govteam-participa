import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { generatePresignedUrl } from "@/lib/storage/minio-client";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().regex(/^(image|audio|video)\/.+$/i, "Tipo de arquivo não suportado"),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    const body = await req.json();
    console.log("[API_UPLOAD_PRESIGNED_URL] Request Body:", body);

    const { fileName, fileType } = uploadSchema.parse(body);
    const data = await generatePresignedUrl(fileName, fileType, organizationId);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API_UPLOAD_PRESIGNED_URL]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados de upload inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
