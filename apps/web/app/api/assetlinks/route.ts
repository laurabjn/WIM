import { NextResponse } from 'next/server';

const PAQUET = 'com.wim.mobile';

export function GET() {
  const empreintes = (process.env.ANDROID_CERT_SHA256 ?? '')
    .split(',')
    .map((empreinte) => empreinte.trim())
    .filter(Boolean);

  if (empreintes.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: PAQUET,
        sha256_cert_fingerprints: empreintes,
      },
    },
  ]);
}
