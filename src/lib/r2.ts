import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET ?? "";
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export function isR2Configured() {
  return Boolean(accountId && accessKeyId && secretAccessKey && R2_BUCKET && R2_PUBLIC_URL);
}

let _client: S3Client | null = null;
function client() {
  if (_client) return _client;
  if (!isR2Configured()) {
    throw new Error("R2 not configured. See .env.local.example for required vars.");
  }
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });
  return _client;
}

const SAFE_FILENAME = /[^a-zA-Z0-9._-]/g;

// Folder is environment-scoped so staging uploads never mix with production assets.
function imageFolder() {
  return process.env.NEXT_PUBLIC_APP_ENVIRONMENT === "production"
    ? "products"
    : "staging-products";
}

export function buildObjectKey(filename: string) {
  const safe = filename.replace(SAFE_FILENAME, "-").slice(0, 80);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${imageFolder()}/${stamp}-${rand}-${safe}`;
}

export async function presignUpload(opts: {
  filename: string;
  contentType: string;
  expiresIn?: number;
}) {
  const key = buildObjectKey(opts.filename);
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: opts.contentType,
  });
  const uploadUrl = await getSignedUrl(client(), cmd, {
    expiresIn: opts.expiresIn ?? 60 * 5,
  });
  return {
    uploadUrl,
    key,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
  };
}

export async function deleteObject(publicUrl: string) {
  if (!publicUrl.startsWith(R2_PUBLIC_URL)) return; // not ours; skip
  const key = publicUrl.slice(R2_PUBLIC_URL.length + 1);
  await client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
