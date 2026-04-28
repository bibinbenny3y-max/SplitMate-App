// App.js
// ---------------------------------------------------------------------------
// Root component. Three responsibilities, deliberately kept minimal so all
// the actual UI lives under screens/:
//   1. Wrap the app in GestureHandlerRootView (required for Swipeable cards)
//   2. Auth gate: if no logged-in user is in AsyncStorage, show LoginScreen;
//      otherwise show the main bottom-tab navigator.
//   3. Stack-on-top of tabs for AddExpense (presented as a modal).
// ---------------------------------------------------------------------------

import 'react-native-gesture-handler'; // must be the first non-react import
import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen      from './screens/LoginScreen';
import HomeScreen       from './screens/HomeScreen';
import ExpensesScreen   from './screens/ExpensesScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import SettlementScreen from './screens/SettlementScreen';
import PeopleScreen     from './screens/PeopleScreen';

import {
  loadAuthUser, saveAuthUser, clearAuthUser, seedIfNeeded,
} from './logic/storage';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// Bottom tabs that are visible after login.
function MainTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle:        { backgroundColor: '#6c5ce7' },
        headerTintColor:    '#fff',
        headerTitleStyle:   { fontWeight: '800' },
        tabBarActiveTintColor:   '#6c5ce7',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle:   { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{ title: 'SplitMate' }}
      >
        {(props) => <HomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: 'Expenses' }}
      />

      <Tab.Screen
        name="Settle"
        component={SettlementScreen}
        options={{ title: 'Settle Up' }}
      />

      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{ title: 'People' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On boot: seed sample data on first launch, then check for a saved session.
  useEffect(() => {
    (async () => {
      await seedIfNeeded();
      const u = await loadAuthUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const handleLogin = useCallback(async (u) => {
    await saveAuthUser(u);
    setUser(u);
  }, []);

  const handleLogout = useCallback(async () => {
    await clearAuthUser();
    setUser(null);
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer>
          <Stack.Navigator>
            {user ? (
              <>
                <Stack.Screen name="Main" options={{ headerShown: false }}>
                  {(props) => <MainTabs {...props} user={user} onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen
                  name="AddExpense"
                  component={AddExpenseScreen}
                  options={{
                    title: 'Add Expense',
                    presentation: 'modal',
                    headerStyle:     { backgroundColor: '#6c5ce7' },
                    headerTintColor: '#fff',
                  }}
                />
              </>
            ) : (
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f7f8fb',
  },
});
