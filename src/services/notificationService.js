import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from '../config/firebase';

// Cấu hình hiển thị thông báo khi app đang mở (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Đăng ký nhận quyền thông báo và lấy Push Notification Token (FCM / Expo)
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f59e0b',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Không được cấp quyền nhận thông báo đẩy!');
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || undefined,
      });
      token = tokenData.data;
    } else {
      // Giả lập token khi chạy trên Web / Trình duyệt Snack
      token = 'ExponentPushToken[Simulated_' + Math.random().toString(36).substring(2, 10) + ']';
    }
  } catch (e) {
    console.warn('Push token warning:', e.message);
    token = 'ExponentPushToken[Simulated_' + Math.random().toString(36).substring(2, 10) + ']';
  }

  return token;
}

/**
 * Lưu FCM Push Token vào Firestore của người dùng hiện tại
 */
export async function savePushTokenToFirestore(userId, token) {
  if (!userId || !token) return;
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set(
      {
        fcmToken: token,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Lỗi khi lưu FCM token vào Firestore:', error.message);
  }
}

/**
 * Bắn một thông báo thử nghiệm trực tiếp trên máy
 */
export async function sendLocalTestNotification(
  title = '🔥 FCM Test Notification',
  body = 'Thông báo đẩy Firebase Cloud Messaging đã hoạt động thành công!'
) {
  try {
    // Nếu chạy trên Web / Browser (Expo Snack Web Preview)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (window.Notification.permission === 'granted') {
          new window.Notification(title, { body });
        } else if (window.Notification.permission !== 'denied') {
          const perm = await window.Notification.requestPermission();
          if (perm === 'granted') {
            new window.Notification(title, { body });
          }
        }
      } catch (webErr) {
        console.log('Web browser notification note:', webErr);
      }
    }

    // Lên lịch bắn thông báo qua Expo Notifications
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { time: new Date().toLocaleTimeString(), sender: 'Firebase FCM Service' },
      },
      trigger: {
        seconds: 1,
      },
    });
    return true;
  } catch (error) {
    console.error('Lỗi khi gửi thông báo cục bộ:', error);
    return false;
  }
}
