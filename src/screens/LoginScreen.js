import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ onNavigateRegister, onDemoLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (!isFirebaseConfigured()) {
      Alert.alert(
        'Chưa cấu hình Firebase',
        'Vui lòng dán cấu hình Firebase của bạn vào file src/config/firebase.js hoặc dùng "Đăng nhập bản Demo" bên dưới.'
      );
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      console.log('Login error:', error.code, error.message);
      let message = 'Đăng nhập thất bại. Vui lòng thử lại!';
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        message = 'Sai mật khẩu hoặc thông tin đăng nhập không đúng.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Tài khoản không tồn tại. Vui lòng đăng ký mới!';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Định dạng email không hợp lệ.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Thử lại quá nhiều lần. Vui lòng chờ giây lát.';
      }
      setErrorMessage(message);
      Alert.alert('Lỗi đăng nhập', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/144/firebase.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Đăng Nhập Firebase</Text>
          <Text style={styles.subtitle}>
            Quản lý tài khoản & Nhận thông báo FCM
          </Text>
        </View>

        {!isFirebaseConfigured() && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={20} color="#b45309" />
            <Text style={styles.warningText}>
              Chưa nhập API Key Firebase trong file{' '}
              <Text style={{ fontWeight: 'bold' }}>src/config/firebase.js</Text>.
              Bạn có thể dán key thật hoặc bấm nút Demo bên dưới để kiểm tra giao diện!
            </Text>
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="nhapemail@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* Nút Đăng nhập */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnRow}>
                <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                <Text style={styles.loginBtnText}>Đăng Nhập</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Nút Demo (dành cho chấm bài / chạy thử ngay khi chưa cấu hình key) */}
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={onDemoLogin}
          >
            <Ionicons name="flask-outline" size={18} color="#f59e0b" />
            <Text style={styles.demoBtnText}>Vào chế độ Dùng thử (Demo Mode)</Text>
          </TouchableOpacity>

          {/* Chuyển sang Đăng ký */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={onNavigateRegister}>
              <Text style={styles.registerLink}> Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    color: '#92400e',
    fontSize: 12,
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    flex: 1,
  },
  form: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  eyeIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
  },
  loginBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 10,
    height: 44,
    marginTop: 12,
    gap: 8,
  },
  demoBtnText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  registerLink: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
});
