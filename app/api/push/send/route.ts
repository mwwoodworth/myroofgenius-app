import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push only if VAPID keys are available
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:support@myroofgenius.com',
    publicKey,
    privateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    // Check if VAPID keys are configured
    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { error: 'Push notifications are not configured. VAPID keys are missing.' },
        { status: 503 }
      )
    }
    
    const { title, body, url } = await request.json()
    
    // In a real app, you would get all subscriptions from your database
    // const subscriptions = await db.pushSubscriptions.findMany()
    
    // For demo purposes, we'll use a mock subscription
    // You would replace this with actual subscriptions from your database
    const mockSubscriptions = [
      // Add your test subscription here
    ]
    
    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/icon?size=192',
      badge: '/icon?size=72',
    })
    
    const results = await Promise.allSettled(
      mockSubscriptions.map(subscription =>
        webpush.sendNotification(subscription, payload)
      )
    )
    
    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length
    
    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: mockSubscriptions.length,
    })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}