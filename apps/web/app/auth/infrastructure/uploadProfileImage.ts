const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(
    `${API_URL}/uploads/avatar`,
    {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }
  );

  const data = await response.json().catch(() => ({}));
  console.log('Upload API response:', { status: response.status, data });

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to upload profile image');
  }

  return data.url as string;
}