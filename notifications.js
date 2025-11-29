import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getLowStockItems,
  getExpiringSoonItems,
  getExpiredItems,
} from "./db";

/* --------------------------------------------
   Notification behavior (foreground/background)
---------------------------------------------*/
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* --------------------------------------------
   Android notification channel
---------------------------------------------*/
export async function createNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Inventory Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }
}

/* --------------------------------------------
   🔐 Check daily + 8AM rule
---------------------------------------------*/
async function canNotifyNow() {
  const now = new Date();

  // ❌ Before 8 AM → block
  if (now.getHours() < 8) return false;

  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const last = await AsyncStorage.getItem("LAST_INVENTORY_NOTIFY");

  // ❌ Already notified today
  if (last === today) return false;

  return true;
}

async function markNotifiedToday() {
  const today = new Date().toISOString().slice(0, 10);
  await AsyncStorage.setItem("LAST_INVENTORY_NOTIFY", today);
}

/* --------------------------------------------
   ✅ MAIN INVENTORY CHECK (CALL ON APP OPEN)
---------------------------------------------*/
export async function runInventoryCheck() {
  console.log("runInventoryCheck called");  // Debug: Confirm function is invoked

  const allowed = await canNotifyNow();
  console.log("Can notify now?", allowed);  // Debug: Check time/daily limit
  if (!allowed) return;

  await createNotificationChannel();

  const perm = await Notifications.requestPermissionsAsync();
  console.log("Permissions status:", perm.status);  // Debug: Check permissions
  if (perm.status !== "granted") return;

  // ✅ Current DB state
  const low = await getLowStockItems();
  const expiring = await getExpiringSoonItems(30);
  const expired = await getExpiredItems();

  console.log("Low stock items:", low.length, "Expiring items:", expiring.length, "Expired items:", expired.length);  // Debug: Check data

  // ✅ If nothing to notify, lock the day
  if (!low.length && !expiring.length && !expired.length) {
    await markNotifiedToday();
    return;
  }

  /* --------------------------------------------
     ✅ Build message WITH MED NAMES
  ---------------------------------------------*/
  let messageParts = [];

  if (low.length) {
    messageParts.push(
      `🟠 LOW STOCK:\n${low.map(i => `• ${i.name} (${i.quantity})`).join("\n")}`
    );
  }

  if (expiring.length) {
    messageParts.push(
      `🔴 EXPIRING SOON:\n${expiring
        .map(i => `• ${i.name} (${i.expiry_date})`)
        .join("\n")}`
    );
  }

  if (expired.length) {
    messageParts.push(
      `⚫ EXPIRED:\n${expired
        .map(i => `• ${i.name} (${i.expiry_date})`)
        .join("\n")}`
    );
  }

  console.log("Scheduling notification...");  // Debug: Before scheduling
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📦 Daily Inventory Alert",
      body: messageParts.join("\n\n"),
      sound: "default",
    },
    trigger: null, // immediate (on app open)
  });
  console.log("Notification scheduled successfully");  // Debug: After scheduling

  await markNotifiedToday();
}
