export async function registerPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');

            // Request permission
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                // Get subscription
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                });

                // Send subscription to server
                await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subscription)
                });

                return true;
            }
        } catch (error) {
            console.error('Push notification registration failed:', error);
            return false;
        }
    }
    return false;
}

export async function showNotification(title: string, options?: NotificationOptions) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, options);
            return true;
        } catch (error) {
            console.error('Failed to show notification:', error);
            return false;
        }
    }
    return false;
}