// notifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medisync-alerts', {
      name: 'MediSync Alerts',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return status === 'granted';
}

// Schedule a notification for an expiry date (daysBefore default 30)
export async function scheduleNotificationForExpiry(stockId, name, expiryDateIso, daysBefore = 30) {
  if (!expiryDateIso) return null;

  const expiry = new Date(expiryDateIso);
  const notifyAt = new Date(expiry.getTime() - daysBefore * 24 * 60 * 60 * 1000);

  // If notifyAt is in the past, schedule immediately (1 second) or skip depending on your policy.
  const trigger = notifyAt > new Date()
    ? { type: 'date', date: notifyAt }
    : { seconds: 1 }; // or return null to skip scheduling

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Expiring soon: ${name}`,
        body: `${name} will expire on ${expiryDateIso}`,
        data: { stockId, type: 'expiry' },
      },
      trigger,
    });
    return id;
  } catch (err) {
    console.warn('schedule expiry failed', err);
    return null;
  }
}

// Schedule a (near-)immediate low-stock notification
export async function scheduleNotificationForLowStock(stockId, name, quantity) {
  try {
    // Immediate-ish notification: trigger with seconds (1) or omit trigger to fire now
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Low stock: ${name}`,
        body: `${name} quantity is ${quantity}`,
        data: { stockId, type: 'low' },
      },
      trigger: { seconds: 1 }, // fires ~1 second later
    });
    return id;
  } catch (err) {
    console.warn('schedule low stock failed', err);
    return null;
  }
}

export async function cancelNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('cancel notif failed', err);
  }
}
