import { NextRequest, NextResponse } from 'next/server';

// 直接调用 Firebase API（需要代理环境）
const FIREBASE_API_KEY = 'AIzaSyDsOl-1XpT5err0Tcnx8FFod1H8gVGIycY';
const FIREBASE_REFRESH_URL = 'https://securetoken.googleapis.com/v1/token';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json({ error: 'refresh_token is required' }, { status: 400 });
    }

    // 直接调用 Firebase API
    const response = await fetch(`${FIREBASE_REFRESH_URL}?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token,
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
      id_token: data.id_token,
      refresh_token: data.refresh_token || refresh_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error('Refresh token API error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
