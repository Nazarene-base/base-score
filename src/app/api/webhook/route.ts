// Webhook API Route
// Handles webhooks from the Base/Farcaster platform

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook for debugging
    console.log('Received webhook:', JSON.stringify(body, null, 2));
    
    // Handle different webhook types
    const { type, data } = body;
    
    switch (type) {
      case 'frame_added':
        // User added the mini app
        console.log('User added app:', data);
        break;
        
      case 'frame_removed':
        // User removed the mini app
        console.log('User removed app:', data);
        break;
        
      case 'notifications_enabled':
        // User enabled notifications
        console.log('Notifications enabled:', data);
        break;
        
      case 'notifications_disabled':
        // User disabled notifications
        console.log('Notifications disabled:', data);
        break;
        
      default:
        console.log('Unknown webhook type:', type);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for verification
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
