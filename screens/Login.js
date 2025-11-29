// screens/Login.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Hardcoded single nurse account
  const nurseAccount = {
    username: 'SNHSNurse',
    password: '@SNHS2025',
  };

  const handleLogin = () => {
    if (username === nurseAccount.username && password === nurseAccount.password) {
      navigation.replace('Dashboard'); // ✅ Go to Dashboard
    } else {
      Alert.alert('Login Failed', 'Invalid username or password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MediSync</Text>
      <Text style={styles.subtitle}>Medicine Inventory Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Offline Access Enabled</Text>
    </View>
  );
}

// Updated styles to match Dashboard theme
const MEDI_PRIMARY = "#35A9FF";      // Aqua Blue
const MEDI_SECONDARY = "#30C9B0";    // Teal Green
const MEDI_BG = "#E6F9F7";           // Soft Mint
const MEDI_TEXT = "#1A3C47";         // Deep bluish text

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: MEDI_BG,  // Match dashboard background
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: MEDI_PRIMARY,  // Match primary color
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: MEDI_TEXT,  // Match text color
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',  // White background for inputs
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D3F0EA',  // Light border like dashboard cards
  },
  button: {
    backgroundColor: MEDI_SECONDARY,  // Match secondary color
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    fontSize: 12,
    color: MEDI_TEXT,  // Match text color
  },
});
