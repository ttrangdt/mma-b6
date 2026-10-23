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
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ onNavigateLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền Họ tên, Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!isFirebaseConfigured()) {
      Alert.alert(
        'Chưa cấu hình Firebase',
        'Vui lòng cấu hình firebase trong file src/config/firebase.js trước khi đăng ký tài khoản thật!'
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo tài khoản trong Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(
        email.trim(),
        password
      );
      const user = userCredential.user;

      const defaultAvatar =
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

      // 2. Cập nhật DisplayName trong Firebase Auth
      await user.updateProfile({
        displayName: fullName.trim(),
        photoURL: defaultAvatar,
      });

      // 3. Lưu thông tin đầy đủ vào Firestore: email, số điện thoại, địa chỉ, họ tên
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || 'Chưa cập nhật',
        address: address.trim() || 'Chưa cập nhật',
        photoURL: defaultAvatar,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Thành công',
        'Đăng ký tài khoản thành công! Bạn có thể sử dụng ngay.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Register error:', error.code, error.message);
      let msg = 'Đăng ký không thành công. Vui lòng thử lại!';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được sử dụng bởi một tài khoản khác.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Định dạng email không hợp lệ.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Mật khẩu quá yếu. Cần tối thiểu 6 ký tự.';
      }
      Alert.alert('Lỗi đăng ký', msg);
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
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/144/firebase.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
          <Text style={styles.subtitle}>Tạo tài khoản Firebase mới</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Họ và tên *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={styles.label}>Email *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="nguyenvana@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="0987654321"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <Text style={styles.label}>Địa chỉ</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Hà Nội, Việt Nam"
              placeholderTextColor="#94a3b8"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <Text style={styles.label}>Mật khẩu *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 6 ký tự"
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

          <Text style={styles.label}>Xác nhận Mật khẩu *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <View style={styles.btnRow}>
                <Ionicons name="person-add-outline" size={20} color="#0f172a" />
                <Text style={styles.registerBtnText}>Tạo Tài Khoản</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={onNavigateLogin}>
              <Text style={styles.loginLink}> Đăng nhập</Text>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
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
  registerBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
  registerBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  loginLink: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
});
