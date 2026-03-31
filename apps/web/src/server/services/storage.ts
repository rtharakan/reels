/**
 * Supabase Storage utility for profile photo uploads.
 * Configures the `profile-photos` bucket (public read, max 5 MB, jpeg/png/webp).
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const BUCKET_NAME = 'profile-photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadResult {
  url: string;
  path: string;
}

/**
 * Generate a signed upload URL for the client to upload directly to Supabase Storage.
 */
export async function createSignedUploadUrl(
  userId: string,
  filename: string,
): Promise<{ signedUrl: string; path: string }> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET_NAME}/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to create signed upload URL: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    signedUrl: `${SUPABASE_URL}/storage/v1${data.url}`,
    path,
  };
}

/**
 * Upload a file buffer directly to Supabase Storage (server-side).
 */
export async function uploadFile(
  userId: string,
  file: Uint8Array,
  mimeType: string,
  filename: string,
): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  if (file.byteLength > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const blob = new Blob([file as unknown as ArrayBuffer], { type: mimeType });
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: blob,
    },
  );

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
  return { url: publicUrl, path };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${path}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    },
  );
}

/**
 * Get the public URL for a stored file.
 */
export function getPublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}
