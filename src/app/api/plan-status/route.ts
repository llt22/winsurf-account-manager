import { NextRequest, NextResponse } from 'next/server';

// 直接调用 Windsurf API（需要代理环境）
const WINDSURF_API = 'https://web-backend.windsurf.com/exa.seat_management_pb.SeatManagementService/GetPlanStatus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth_token } = body;

    if (!auth_token) {
      return NextResponse.json({ error: 'auth_token is required' }, { status: 400 });
    }

    const response = await fetch(WINDSURF_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': auth_token,
      },
      body: JSON.stringify({ auth_token }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Upstream error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
