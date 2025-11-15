import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// --------------------------------------------------
// ASK PERMISSION
// --------------------------------------------------
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("medisync-alerts", {
      name: "MediSync Alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return status === "granted";
}

// --------------------------------------------------
// LOW STOCK NOTIFICATION (single medicine)
// --------------------------------------------------
export async function scheduleNotificationForLowStock(id, name, qty) {
  try {
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Low Stock Alert",
        body: `${name} stock is low (${qty} remaining).`,
        data: { type: "low_stock", stockId: id },
      },
      trigger: null, // immediate notification
    });

    console.log("Low stock notification scheduled:", notifId);
    return notifId;
  } catch (err) {
    console.warn("Failed to schedule low stock:", err);
    return null;
  }
}

// --------------------------------------------------
// EXPIRY NOTIFICATION (medicine-specific)
// --------------------------------------------------
export async function scheduleNotificationForExpiry(
  id,
  name,
  expiryDate,
  daysBefore = 30
) {
  try {
    const target = new Date(expiryDate);
    const notifyDate = new Date(target.getTime() - daysBefore * 86400000);
    const now = new Date();

    let trigger;

    if (notifyDate <= now) {
      console.log("⏳ Expiry notify date passed — sending notification now");
      trigger = null; // fire immediately
    } else {
      trigger = notifyDate; // schedule on correct date
    }

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🕒 Medicine Expiry Alert",
        body: `${name} will expire on ${expiryDate}.`,
        data: { type: "expiry", stockId: id },
      },
      trigger,
    });

    console.log("Expiry notification scheduled:", notifId);
    return notifId;
  } catch (err) {
    console.warn("Failed to schedule expiry:", err);
    return null;
  }
}


// --------------------------------------------------
// DAILY INVENTORY CHECK (8AM)
// --------------------------------------------------
import { getAllStocks } from "./db";

export async function scheduleDailyInventoryCheckFromDB() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const stocks = await getAllStocks();
    const now = new Date();

    let lowStock = [];
    let expired = [];
    let expiringSoon = [];

    for (const med of stocks) {
      const qty = Number(med.quantity);
      const low = Number(med.low_threshold);
      const expiry = med.expiry_date ? new Date(med.expiry_date) : null;

      if (qty <= low) lowStock.push(med.name);
      if (expiry && expiry < now) expired.push(med.name);
      else if (expiry && expiry - now <= 30 * 86400000) expiringSoon.push(med.name);
    }

    let message = "Inventory Status:\n";
    if (lowStock.length) message += `⚠️ Low: ${lowStock.join(", ")}\n`;
    if (expired.length) message += `❌ Expired: ${expired.join(", ")}\n`;
    if (expiringSoon.length) message += `🕒 Expiring Soon: ${expiringSoon.join(", ")}`;

    if (message === "Inventory Status:\n") {
      message = "✅ All medicines are in good condition.";
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 MediSync Daily Inventory Check",
        body: message,
      },
      trigger: { hour: 8, minute: 0, repeats: true },
    });

    console.log("✅ Daily 8AM inventory check notification scheduled.");
  } catch (error) {
    console.warn("Daily check failed:", error);
  }
}
