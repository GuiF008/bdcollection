import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

function getUploadPath(): string {
  return path.resolve(/* turbopackIgnore: true */ UPLOAD_DIR);
}

export async function ensureUploadDir(): Promise<void> {
  const dir = getUploadPath();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export async function saveFile(file: File, prefix: string): Promise<string> {
  await ensureUploadDir();

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${prefix}-${Date.now()}${ext}`;
  const filepath = path.join(getUploadPath(), filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  const filename = fileUrl.replace("/uploads/", "");
  const filepath = path.join(getUploadPath(), filename);

  if (existsSync(filepath)) {
    await unlink(filepath);
  }
}
