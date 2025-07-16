'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === 'granted') {
        await subscribeUser()
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      })

      setSubscription(subscription)
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
    }
  }

  const unsubscribeUser = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe()
        setSubscription(null)
        
        // Remove subscription from server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error)
      }
    }
  }

  const sendTestNotification = async () => {
    if (!subscription) return

    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test notification from MyRoofGenius',
          url: '/',
        }),
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {subscription ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h3 className="text-sm font-medium">Push Notifications</h3>
            <p className="text-xs text-gray-400">
              {subscription
                ? 'Enabled - Get notified about updates'
                : 'Stay updated with the latest features'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {permission === 'granted' ? (
            subscription ? (
              <>
                <button
                  onClick={sendTestNotification}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded tap-target-sm"
                >
                  Test
                </button>
                <button
                  onClick={unsubscribeUser}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded tap-target-sm"
                >
                  Disable
                </button>
              </>
            ) : (
              <button
                onClick={subscribeUser}
                className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded tap-target-sm"
              >
                Enable
              </button>
            )
          ) : (
            <button
              onClick={requestPermission}
              className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded tap-target-sm"
            >
              Allow
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}