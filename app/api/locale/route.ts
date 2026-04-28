import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  let locale: string;
  try {
    ({ locale } = await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!['es', 'en'].includes(locale)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const cookieStore = await cookies();
  cookieStore.set('AGORA_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return NextResponse.json({ ok: true });
}
