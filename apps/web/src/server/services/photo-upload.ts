import type { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from './storage';

const MAX_PHOTOS = 6;

interface PhotoUploadResult {
  url: string;
  profilePhotos: string[];
}

/**
 * Upload a profile photo, resize/validate on server, store in Supabase Storage,
 * and update the user's profilePhotos array.
 */
export async function uploadProfilePhoto(
  prisma: PrismaClient,
  userId: string,
  file: Uint8Array,
  mimeType: string,
  filename: string,
): Promise<PhotoUploadResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePhotos: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.profilePhotos.length >= MAX_PHOTOS) {
    throw new Error(`Maximum ${MAX_PHOTOS} photos allowed`);
  }

  const { url } = await uploadFile(userId, file, mimeType, filename);

  const updatedPhotos = [...user.profilePhotos, url];
  await prisma.user.update({
    where: { id: userId },
    data: { profilePhotos: updatedPhotos },
  });

  return { url, profilePhotos: updatedPhotos };
}

/**
 * Remove a profile photo by URL from the user's profile and storage.
 */
export async function removeProfilePhoto(
  prisma: PrismaClient,
  userId: string,
  photoUrl: string,
): Promise<{ profilePhotos: string[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePhotos: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updatedPhotos = user.profilePhotos.filter((p) => p !== photoUrl);

  // Extract storage path from URL
  const pathMatch = photoUrl.match(/profile-photos\/(.+)$/);
  if (pathMatch?.[1]) {
    await deleteFile(pathMatch[1]);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { profilePhotos: updatedPhotos },
  });

  return { profilePhotos: updatedPhotos };
}
