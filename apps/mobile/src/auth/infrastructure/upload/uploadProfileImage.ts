const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

export async function uploadProfileImage(uri: string): Promise<string> {
  console.log('UPLOAD uri =', uri);
  console.log('UPLOAD API_URL =', API_URL);

  const filename = uri.split('/').pop() ?? 'profile.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);

  console.log('UPLOAD before fetch');

  const res = await fetch(`${API_URL}/uploads/avatar`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  console.log('UPLOAD status =', res.status);

  const data = await res.json().catch(() => ({}));
  console.log('UPLOAD response =', data);

  if (!res.ok) {
    throw new Error(data?.message ?? 'Upload failed');
  }

  return data.url;
}