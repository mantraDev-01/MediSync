// FULLY FIXED + CLEANED + ANIMATED APP.JS

import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  View,
  Dimensions,
  Animated,
  TouchableOpacity,
  StyleSheet,
  AppState,
} from "react-native";
import Dashboard from "./screens/Dashboard";
import StockEntry from "./screens/StockEntry";
import DispenseScreen from "./screens/DispenseScreen";
import ExportSelect from "./screens/ExportSelect";
import ExportInventory from "./screens/ExportInventory";
import ExportDispensed from "./screens/ExportDispensed";
import Login from "./screens/Login";
import { runInventoryCheck } from "./notifications";
import { LogBox } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Pressable } from "react-native";

LogBox.ignoreAllLogs(true);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

// Dummy component for the Plus tab
const DummyScreen = () => <View />;

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
  // Run on initial app launch
  runInventoryCheck();
  // Also run on app state changes to foreground
  const sub = AppState.addEventListener("change", (nextState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextState === "active"
    ) {
      runInventoryCheck();
    }
    appState.current = nextState;
  });
  return () => sub.remove();
}, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboardx" component={Dashboard} options={{ title: "Dashboard" }} />
        <Stack.Screen name="StockEntry" component={StockEntry} options={{ title: "Add / Edit Stock" }} />
        <Stack.Screen name="DispenseScreen" component={DispenseScreen} options={{ title: "Dispense Medicine" }} />
        <Stack.Screen name="ExportScreen" component={ExportSelect} options={{ title: "Export Options" }} />
        <Stack.Screen name="ExportInventory" component={ExportInventory} options={{ title: "Export Inventory" }} />
        <Stack.Screen name="ExportDispensed" component={ExportDispensed} options={{ title: "Export Dispensed" }} />
        <Stack.Screen name="Dashboard" component={TabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ==========================
     TAB NAVIGATOR FIXED
========================== */
const TabNavigator = () => {
  const [popupVisible, setPopupVisible] = useState(false);

  const popupAnim = useRef(new Animated.Value(0)).current;
  const plusAnim = useRef(new Animated.Value(0)).current;
  const iconAnim1 = useRef(new Animated.Value(0)).current;
  const iconAnim2 = useRef(new Animated.Value(0)).current;

  const togglePopup = () => {
    if (popupVisible) {
      Animated.parallel([
        Animated.timing(iconAnim1, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(iconAnim2, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(popupAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(plusAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setPopupVisible(false));
      });
    } else {
      setPopupVisible(true);
      Animated.parallel([
        Animated.timing(popupAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(plusAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(iconAnim1, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(80),
          Animated.timing(iconAnim2, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      });
    }
  };

  const popupTranslateY = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const plusTranslateY = plusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    const tabWidth = width / 3;

    return (
      // top-level contains absolute children; ensure nothing clips them
      <View style={{ position: "relative", height: 160, }}>
        {/* Popup - absolutely positioned above the floating plus */}
        {popupVisible && (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.popup,
              {
                position: "absolute",
                bottom: 190, // clear of tab bar
                left: width / 3,
                width: tabWidth,
                transform: [{ translateY: popupTranslateY }],
                zIndex: 50,
                elevation: 50,
              
              },
            ]}
          >
            <View style={styles.popupRow}>
              <Animated.View style={{ opacity: iconAnim1, transform: [{ scale: iconAnim1 }] }}>
                <Pressable
                  onPress={() => {
                    togglePopup();
                    navigation.navigate("StockEntry");
                  }}
                  android_ripple={{ color: "transparent" }}
                  style={styles.popupIcon}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="edit" color="white" size={24} />
                  </View>
                </Pressable>
              </Animated.View>

              <Animated.View style={{ opacity: iconAnim2, transform: [{ scale: iconAnim2 }] }}>
                <Pressable
                  onPress={() => {
                    togglePopup();
                    navigation.navigate("DispenseScreen");
                  }}
                  android_ripple={{ color: "transparent" }}
                  style={styles.popupIcon}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="local-pharmacy" color="white" size={24} />
                  </View>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        )}

        {/* TAB BAR (static) */}
        <View style={[styles.tabBar, { overflow: "visible" }]}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            // Skip Plus here; it's rendered as floating button
            if (route.name === "Plus") {
              return (
                // render an invisible placeholder so layout spacing is correct
                <View key={route.key} style={{ width: tabWidth }} />
              );
            }

            const icons = {
              Dashboard: "home",
              Export: "file-download",
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                activeOpacity={1} // avoid opacity flashing which reveals gray on Android
                onPress={() => {
                  if (popupVisible) togglePopup();
                  navigation.navigate(route.name);
                }}
                style={[styles.tabItem, { width: tabWidth }]}
              >
                <Icon
                  name={icons[route.name]}
                  color={isFocused ? "#30C9B0" : "gray"}
                  size={26}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FLOATING PLUS BUTTON */}
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: width / 2 - 27,
            bottom: 88,
            transform: [{ translateY: plusTranslateY }],
            zIndex: 100,
            elevation: 100,
          }}
        >
          <Pressable
            onPress={togglePopup}
            android_ripple={{ color: "transparent" }}
            style={({ pressed }) => [
              {
                width: 55,
                height: 55,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                elevation: 8,
                // keep background stable when pressed
                backgroundColor: popupVisible ? "#30C9B0" : "#fff",
              },
            ]}
          >
            <Icon name="add" color={popupVisible ? "white" : "gray"} size={26} />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Plus" component={DummyScreen} />
      <Tab.Screen name="Export" component={ExportSelect} />

      {/* Hidden screens for navigation */}
      <Tab.Screen name="StockEntry" component={StockEntry} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="DispenseScreen" component={DispenseScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
};

/* =======================
      STYLES
======================= */
const styles = StyleSheet.create({
  // in styles
tabBar: {
  flexDirection: "row",
  backgroundColor: "#fff",
  paddingBottom: 10,
  paddingTop: 10,
  height: 90,
  alignItems: "center",
  justifyContent: "space-between",

  // 👇 NEW ROUND TABBAR SHAPE
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  borderTopWidth: 0,
  elevation: 20,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: -4 },

  marginHorizontal: 10,   // optional
  overflow: "visible",    // do NOT clip floating button
},


  tabItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    
    borderRadius: 12,
    padding: 12,
    elevation: 10,
  },
  popupRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  popupIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 55,
    height: 55,
    backgroundColor: "#30C9B0",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
