import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

// Configure how notifications behave when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permissions Required",
      "Notifications are needed for daily reminders. Please enable them in settings."
    );
  }
  return status === "granted";
}

/* ----------------------------------------------------------
   ✅ Schedule AUTOMATIC daily notification at 8 AM with a fixed message
   - This schedules a simple reminder notification every day at 8:00 AM.
   - No database checks or dynamic content—just a fixed message.
---------------------------------------------------------- */
export async function scheduleDailyReminder() {
  // Cancel existing schedules
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Check permissions first
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  try {
    // Schedule a notification to appear every day at 8:00 AM with a fixed message
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📦 Daily Reminder",
        body: "Good morning! Check for expiring, low stock, or expired medicines.",
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.error("Error scheduling daily reminder:", error);
    Alert.alert("Error", "Failed to schedule daily notification.");
  }
}

/* ----------------------------------------------------------
   ✅ Schedule notification for low stock (immediate alert)
   - Schedules an immediate notification if stock is low.
   - Returns the notification ID for storage/cancellation.
---------------------------------------------------------- */
export async function scheduleNotificationForLowStock(stockId, medName, quantity) {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Low Stock Alert",
        body: `${medName} is low in stock (Quantity: ${quantity}). Please replenish.`,
      },
      trigger: null, // Immediate
    });
    return notificationId; // Return ID to store in DB
  } catch (error) {
    console.error("Error scheduling low stock notification:", error);
    return null; // Return null if failed, so DB can handle it
  }
}

/* ----------------------------------------------------------
   ✅ Schedule notification for expiry (alert X days before expiry)
   - Schedules a notification to appear X days before the expiry date.
   - Returns the notification ID for storage/cancellation.
---------------------------------------------------------- */
export async function scheduleNotificationForExpiry(stockId, medName, expiryDate, daysBefore) {
  try {
    const expiry = new Date(expiryDate);
    const alertDate = new Date(expiry.getTime() - daysBefore * 24 * 60 * 60 * 1000); // X days before

    // Only schedule if the alert date is in the future
    if (alertDate <= new Date()) {
      console.warn(`Expiry alert for ${medName} is in the past or too soon—skipping.`);
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏳ Expiry Alert",
        body: `${medName} expires on ${expiryDate}. Check and replace soon.`,
      },
      trigger: {
        date: alertDate, // Schedule for the calculated date
      },
    });
    return notificationId; // Return ID to store in DB
  } catch (error) {
    console.error("Error scheduling expiry notification:", error);
    return null; // Return null if failed
  }
}

/* ----------------------------------------------------------
   ✅ Reads DB and notifies user (low stock, expiry) - for manual checks
---------------------------------------------------------- */
export async function runInventoryCheck() {
  // ... (unchanged from previous versions)
}