import { HomePhoto } from "@wim/shared/home/home.type";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

export type UploadPhoto = {
  uri: string;
  name: string;
  type: string;
};

export async function uploadHomeImage(
  token: string,
  homeId: string,
  photo: UploadPhoto,
): Promise<HomePhoto> {
  const formData = new FormData();

  formData.append('file', {
    uri: photo.uri,
    name: photo.name ?? `home-photo-${Date.now()}.jpg`,
    type: photo.type ?? 'image/jpeg',
  } as any);

  const res = await fetch(`${API_URL}/uploads/home`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Impossible d’uploader la photo');
  }

  return res.json();
}

export async function uploadHomePhotos(
    token: string,
    homeId: string,
    photos: UploadPhoto[],
): Promise<HomePhoto[]> {
    const uploadedPhotos: HomePhoto[] = [];

    for (const photo of photos) {
      const uploadedPhoto = await uploadHomeImage(token, homeId, photo);
      uploadedPhotos.push(uploadedPhoto);
    }
    console.log('Uploaded photos:', uploadedPhotos);
    return uploadedPhotos;
}