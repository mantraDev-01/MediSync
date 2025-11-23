// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "./screens/Dashboard";
import StockEntry from "./screens/StockEntry";
import DispenseScreen from "./screens/DispenseScreen";
import ExportSelect from "./screens/ExportSelect";
import ExportInventory from "./screens/ExportInventory";
import ExportDispensed from "./screens/ExportDispensed";
import Login from "./screens/Login";

import { initDB } from "./db";
import {
  requestNotificationPermissions,
  scheduleDailyReminder, // Updated to match the new function name in notifications.js
} from "./notifications";

import { LogBox } from "react-native";
LogBox.ignoreAllLogs(true);

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        // Initialize SQLite db
        await initDB();

        // Ask notification permission
        const granted = await requestNotificationPermissions();

        // Schedule the daily 8 AM reminder
        if (granted) {
          await scheduleDailyReminder(); // Updated function call
        } else {
          console.warn("Notification permission not granted.");
        }
      } catch (err) {
        console.warn("Init error:", err);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: "Dashboard" }}
        />

        <Stack.Screen
          name="StockEntry"
          component={StockEntry}
          options={{ title: "Add / Edit Stock" }}
        />

        <Stack.Screen
          name="DispenseScreen"
          component={DispenseScreen}
          options={{ title: "Dispense Medicine" }}
        />

        <Stack.Screen
          name="ExportScreen"
          component={ExportSelect}
          options={{ title: "Export Options" }}
        />

        <Stack.Screen
          name="ExportInventory"
          component={ExportInventory}
          options={{ title: "Export Inventory" }}
        />

        <Stack.Screen
          name="ExportDispensed"
          component={ExportDispensed}
          options={{ title: "Export Dispensed" }}
        />
      </Stack.Navigator>


    </NavigationContainer>
  );
}
