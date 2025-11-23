import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Dashboard from "../screens/Dashboard";
import StockEntry from "../screens/StockEntry";
import DispenseScreen from "../screens/DispenseScreen";


const Tab = createBottomTabNavigator();

export default function AppNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#28C7B7",
        tabBarInactiveTintColor: "#A0B5C4",
        tabBarStyle: {
          height: 70,
          backgroundColor: "#F3FBFA",
          borderTopWidth: 0,
          elevation: 5,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Dashboard") iconName = "grid-outline";
          if (route.name === "StockEntry") iconName = "add-circle-outline";
          if (route.name === "DispenseScreen") iconName = "remove-circle-outline";
          if (route.name === "ExportScreen") iconName = "download-outline";

          return <Ionicons name={iconName} size={30} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="StockEntry" component={StockEntry} />
      <Tab.Screen name="DispenseScreen" component={DispenseScreen} />
      <Tab.Screen name="ExportScreen" component={ExportScreen} />
    </Tab.Navigator>
  );
}
