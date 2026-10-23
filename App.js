import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { auth, isFirebaseConfigured } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import { Ionicons } from '@expo/vector-icons';
import { registerForPushNotificationsAsync } from './src/services/notificationService';

export default function App() {
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'notifications'

  useEffect(() => {
    registerForPushNotificationsAsync();

    if (isFirebaseConfigured()) {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        if (!isDemo) {
          setUser(currentUser);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [isDemo]);

  const handleDemoLogin = () => {
    setIsDemo(true);
    setUser({
      uid: 'demo_user_12345',
      displayName: 'Nguyễn Văn Demo',
      email: 'demo.student@mma.edu.vn',
      photoURL:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });
  };

  const handleLogout = () => {
    setUser(null);
    setIsDemo(false);
    setAuthScreen('login');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Đang tải ứng dụng...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        {authScreen === 'login' ? (
          <LoginScreen
            onNavigateRegister={() => setAuthScreen('register')}
            onDemoLogin={handleDemoLogin}
          />
        ) : (
          <RegisterScreen
            onNavigateLogin={() => setAuthScreen('login')}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Ionicons name="flame" size={24} color="#f59e0b" />
          <Text style={styles.topBarTitle}>Firebase App</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.screenContent}>
        {activeTab === 'profile' ? (
          <ProfileScreen
            user={user}
            isDemo={isDemo}
            onLogout={handleLogout}
          />
        ) : (
          <NotificationScreen user={user} />
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? '#f59e0b' : '#64748b'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'profile' && styles.navTextActive,
            ]}
          >
            Tài Khoản
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navItem,
            activeTab === 'notifications' && styles.navItemActive,
          ]}
          onPress={() => setActiveTab('notifications')}
        >
          <Ionicons
            name={
              activeTab === 'notifications'
                ? 'notifications'
                : 'notifications-outline'
            }
            size={22}
            color={activeTab === 'notifications' ? '#f59e0b' : '#64748b'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'notifications' && styles.navTextActive,
            ]}
          >
            FCM Thông Báo
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  screenContent: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    transform: [{ scale: 1.05 }],
  },
  navText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#f59e0b',
    fontWeight: '700',
  },
});
