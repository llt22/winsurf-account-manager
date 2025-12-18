import { NextRequest, NextResponse } from 'next/server';

// 直接调用 Firebase API（需要代理环境）
const FIREBASE_API_KEY = 'AIzaSyDsOl-1XpT5err0Tcnx8FFod1H8gVGIycY';
const FIREBASE_LOGIN_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    // 直接调用 Firebase API
    const response = await fetch(`${FIREBASE_LOGIN_URL}?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      email: data.email,
      expiresIn: data.expiresIn,
      localId: data.localId,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Login API error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
