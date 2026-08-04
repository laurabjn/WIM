import { API_URL } from '../../../config/api';
import { HomePhoto } from '@wim/shared/home/home.type';


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

  formData.append(
    'file',
    {
      uri: photo.uri,
      name: photo.name || `home-photo-${Date.now()}.jpg`,
      type: photo.type || 'image/jpeg',
    } as any,
  );

  console.log('Upload logement :', {
    url: `${API_URL}/homes/${homeId}/photos`,
    homeId,
    photo,
  });

  const response = await fetch(
    `${API_URL}/homes/${homeId}/photos`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const responseText = await response.text();

  let data: any = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  console.log('Réponse upload logement :', {
    status: response.status,
    data,
  });

  if (!response.ok) {
    const message =
      typeof data === 'object'
        ? data?.message
        : data;

    throw new Error(
      message || `Impossible d’uploader la photo (${response.status})`,
    );
  }

  return data as HomePhoto;
}