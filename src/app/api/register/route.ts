import { NextRequest, NextResponse } from 'next/server';

const WINDSURF_REGISTER_API = 'https://register.windsurf.com/exa.seat_management_pb.SeatManagementService/RegisterUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebase_id_token } = body;

    if (!firebase_id_token) {
      return NextResponse.json({ error: 'firebase_id_token is required' }, { status: 400 });
    }

    const response = await fetch(WINDSURF_REGISTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firebase_id_token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      api_key: data.api_key,
      name: data.name,
      api_server_url: data.api_server_url,
    });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
