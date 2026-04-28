// screens/LoginScreen.js
// ---------------------------------------------------------------------------
// Pre-built login. The brief says no sign-up flow, and that credentials must
// "appear on the screen where they are to be used" - so the demo accounts
// are rendered as tappable cards that auto-fill the form. Wrong creds
// shake the form and surface an inline error.
// ---------------------------------------------------------------------------

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Easing,
} from 'react-native';
import { DEMO_ACCOUNTS, findAccount } from '../auth/credentials';

export default function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1,  duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1,  duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    const acc = findAccount(email, password);
    if (!acc) {
      setError('Wrong email or password.');
      shake();
      return;
    }
    setError('');
    onLogin?.({
      id: acc.id,
      email: acc.email,
      displayName: acc.displayName,
    });
  };

  const fillFromAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.logo}>💷 SplitMate</Text>
          <Text style={styles.tagline}>settle the household, simply</Text>
        </View>

        <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@splitmate.demo"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="password123"
            secureTextEntry
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Pre-built credentials shown on screen, per the brief. */}
        <View style={styles.demoBlock}>
          <Text style={styles.demoHeading}>Demo accounts (tap to fill)</Text>
          {DEMO_ACCOUNTS.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={styles.demoCard}
              onPress={() => fillFromAccount(acc)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.demoName}>{acc.displayName}</Text>
                <Text style={styles.demoEmail}>{acc.email}</Text>
              </View>
              <Text style={styles.demoPwd}>{acc.password}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.demoNote}>
            No registration is supported — these are the only valid logins.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#6c5ce7' },
  scroll: { padding: 24, paddingTop: 64, paddingBottom: 40 },

  brand:    { alignItems: 'center', marginBottom: 24 },
  logo:     { fontSize: 30, fontWeight: '800', color: '#fff' },
  tagline:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  label: { fontSize: 12, fontWeight: '700', color: '#444', marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#dcdde6',
    borderRadius: 10, padding: 12, fontSize: 14, marginTop: 4, color: '#222',
  },
  error: { color: '#b8312f', fontSize: 12, marginTop: 8, fontWeight: '600' },
  btn: {
    backgroundColor: '#6c5ce7', borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 16,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  demoBlock: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14, padding: 14,
  },
  demoHeading: { color: '#fff', fontWeight: '700', marginBottom: 10, fontSize: 13 },
  demoCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10,
    padding: 12, marginBottom: 8,
  },
  demoName:  { fontWeight: '700', color: '#1a1a2e', fontSize: 14 },
  demoEmail: { color: '#666', fontSize: 12, marginTop: 2 },
  demoPwd:   { color: '#6c5ce7', fontWeight: '700', fontSize: 12 },
  demoNote:  { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4, textAlign: 'center' },
});
