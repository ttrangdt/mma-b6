import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import {
  registerForPushNotificationsAsync,
  sendLocalTestNotification,
  savePushTokenToFirestore,
} from '../services/notificationService';

export default function NotificationScreen({ user }) {
  const [pushToken, setPushToken] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form gửi thông báo test
  const [testTitle, setTestTitle] = useState('🔥 Firebase Cloud Messaging');
  const [testBody, setTestBody] = useState(
    'Ứng dụng đã nhận được thông báo đẩy thành công!'
  );
  const [sendingTest, setSendingTest] = useState(false);

  // Danh sách thông báo đã nhận
  const [receivedList, setReceivedList] = useState([]);

  useEffect(() => {
    fetchToken();

    // Lắng nghe khi có thông báo đẩy đến ứng dụng (Foreground)
    const notificationListener =
      Notifications.addNotificationReceivedListener((notification) => {
        const item = {
          id: notification.request.identifier,
          title: notification.request.content.title,
          body: notification.request.content.body,
          date: new Date().toLocaleTimeString(),
        };
        setReceivedList((prev) => [item, ...prev]);
      });

    // Lắng nghe khi người dùng bấm vào thông báo
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const title = response.notification.request.content.title;
        Alert.alert('Bạn đã bấm vào thông báo', title);
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const fetchToken = async () => {
    setLoadingToken(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        if (user?.uid) {
          await savePushTokenToFirestore(user.uid, token);
        }
      } else {
        setPushToken('Không thể lấy Token (Hãy kiểm tra quyền thông báo)');
      }
    } catch (e) {
      console.warn('Token error:', e.message);
      setPushToken('Token: Sim_FCM_' + Date.now());
    } finally {
      setLoadingToken(false);
    }
  };

  const handleCopyToken = async () => {
    if (!pushToken) return;
    await Clipboard.setStringAsync(pushToken);
    setCopied(true);
    Alert.alert('Đã sao chép', 'FCM Push Token đã được chép vào bộ nhớ tạm.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendTest = async () => {
    if (!testTitle.trim() || !testBody.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung thông báo');
      return;
    }
    setSendingTest(true);
    try {
      await sendLocalTestNotification(testTitle.trim(), testBody.trim());
      Alert.alert('Thành công', 'Thông báo sẽ xuất hiện trên màn hình trong giây lát!');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể gửi thông báo: ' + e.message);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Ionicons name="notifications-outline" size={28} color="#f59e0b" />
        </View>
        <View style={styles.bannerTextBox}>
          <Text style={styles.bannerTitle}>Dịch Vụ FCM Push Notification</Text>
          <Text style={styles.bannerSubtitle}>
            Tích hợp Firebase Cloud Messaging để nhận và hiển thị thông báo đẩy
          </Text>
        </View>
      </View>

      {/* Box Hiển thị Push Token */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>FCM / Expo Push Token</Text>
          <TouchableOpacity onPress={fetchToken} disabled={loadingToken}>
            <Ionicons name="reload" size={18} color="#38bdf8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardDesc}>
          Token định danh thiết bị của bạn. Dùng token này để gửi thông báo từ Firebase Console hoặc API:
        </Text>

        <View style={styles.tokenBox}>
          {loadingToken ? (
            <ActivityIndicator color="#f59e0b" />
          ) : (
            <Text style={styles.tokenText} numberOfLines={3} selectable>
              {pushToken || 'Đang tải Token...'}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.copyBtn, copied && styles.copiedBtn]}
          onPress={handleCopyToken}
        >
          <Ionicons
            name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
            size={18}
            color={copied ? '#ffffff' : '#0f172a'}
          />
          <Text
            style={[styles.copyBtnText, copied && { color: '#ffffff' }]}
          >
            {copied ? 'Đã Sao Chép Token' : 'Sao Chép FCM Token'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Thử nghiệm gửi thông báo trực tiếp */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thử Nghiệm Gửi Thông Báo (Test)</Text>
        <Text style={styles.cardDesc}>
          Kiểm tra nhanh tính năng hiển thị thông báo đẩy trên thiết bị:
        </Text>

        <Text style={styles.inputLabel}>Tiêu đề thông báo</Text>
        <TextInput
          style={styles.input}
          value={testTitle}
          onChangeText={setTestTitle}
          placeholder="Nhập tiêu đề..."
          placeholderTextColor="#64748b"
        />

        <Text style={styles.inputLabel}>Nội dung thông báo</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          value={testBody}
          onChangeText={setTestBody}
          placeholder="Nhập nội dung thông báo..."
          placeholderTextColor="#64748b"
          multiline
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendTest}
          disabled={sendingTest}
        >
          {sendingTest ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <View style={styles.btnRow}>
              <Ionicons name="paper-plane-outline" size={18} color="#0f172a" />
              <Text style={styles.sendBtnText}>Kích Hoạt Nhận Thông Báo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Danh sách thông báo vừa nhận */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông Báo Gần Đây ({receivedList.length})</Text>
        {receivedList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={36} color="#475569" />
            <Text style={styles.emptyText}>Chưa có thông báo nào trong phiên này</Text>
          </View>
        ) : (
          receivedList.map((item, idx) => (
            <View key={item.id || idx} style={styles.notifItem}>
              <View style={styles.notifIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#f59e0b" />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeaderRow}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifTime}>{item.date}</Text>
                </View>
                <Text style={styles.notifBody}>{item.body}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Hướng dẫn gửi từ Firebase Console */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>💡 Hướng dẫn gửi từ Firebase Console:</Text>
        <Text style={styles.guideStep}>
          1. Truy cập <Text style={styles.highlight}>Firebase Console</Text> {'>'} Dự án của bạn.
        </Text>
        <Text style={styles.guideStep}>
          2. Chọn menu <Text style={styles.highlight}>Engage</Text> {'>'} <Text style={styles.highlight}>Messaging (FCM)</Text>.
        </Text>
        <Text style={styles.guideStep}>
          3. Bấm <Text style={styles.highlight}>"Create your first campaign"</Text> {'>'} <Text style={styles.highlight}>Firebase Notification messages</Text>.
        </Text>
        <Text style={styles.guideStep}>
          4. Nhập tiêu đề & nội dung, bấm <Text style={styles.highlight}>"Send test message"</Text> và dán FCM Token ở trên.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 18,
  },
  tokenBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  tokenText: {
    fontFamily: 'monospace',
    color: '#38bdf8',
    fontSize: 12,
    lineHeight: 18,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  copiedBtn: {
    backgroundColor: '#10b981',
  },
  copyBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  sendBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sendBtnText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
  },
  notifItem: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  notifIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  notifTime: {
    fontSize: 11,
    color: '#64748b',
  },
  notifBody: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  guideCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 8,
  },
  guideStep: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 4,
  },
  highlight: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
});
