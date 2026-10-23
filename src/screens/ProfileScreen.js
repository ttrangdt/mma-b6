import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { auth, db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ user, isDemo, onLogout }) {
  const [fullName, setFullName] = useState(user?.displayName || 'Người dùng');
  const [email, setEmail] = useState(user?.email || 'user@example.com');
  const [phone, setPhone] = useState('Chưa cập nhật');
  const [address, setAddress] = useState('Chưa cập nhật');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.photoURL ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  );

  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (isDemo || !user?.uid) return;
    try {
      setLoading(true);
      const docSnap = await db.collection('users').doc(user.uid).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.address) setAddress(data.address);
        if (data.photoURL) setAvatarUrl(data.photoURL);
      }
    } catch (e) {
      console.warn('Lỗi tải dữ liệu người dùng:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setEditFullName(fullName);
    setEditEmail(email);
    setEditPhone(phone === 'Chưa cập nhật' ? '' : phone);
    setEditAddress(address === 'Chưa cập nhật' ? '' : address);
    setEditAvatarUrl(avatarUrl);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim() || !editEmail.trim()) {
      Alert.alert('Lỗi', 'Họ tên và Email không được để trống.');
      return;
    }

    if (isDemo) {
      setFullName(editFullName);
      setEmail(editEmail);
      setPhone(editPhone.trim() || 'Chưa cập nhật');
      setAddress(editAddress.trim() || 'Chưa cập nhật');
      if (editAvatarUrl.trim()) setAvatarUrl(editAvatarUrl.trim());
      setIsEditModalVisible(false);
      Alert.alert('Thành công (Demo)', 'Đã cập nhật thông tin người dùng!');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      const updates = {
        fullName: editFullName.trim(),
        phone: editPhone.trim() || 'Chưa cập nhật',
        address: editAddress.trim() || 'Chưa cập nhật',
        photoURL: editAvatarUrl.trim() || avatarUrl,
        updatedAt: new Date().toISOString(),
      };

      if (editEmail.trim() !== currentUser.email) {
        try {
          await currentUser.updateEmail(editEmail.trim());
          updates.email = editEmail.trim();
        } catch (emailErr) {
          if (emailErr.code === 'auth/requires-recent-login') {
            Alert.alert(
              'Yêu cầu xác thực',
              'Để đổi Email, bạn cần đăng xuất và đăng nhập lại gần đây.'
            );
          } else {
            throw emailErr;
          }
        }
      }

      await currentUser.updateProfile({
        displayName: editFullName.trim(),
        photoURL: updates.photoURL,
      });

      await db.collection('users').doc(currentUser.uid).set(updates, { merge: true });

      setFullName(updates.fullName);
      setEmail(editEmail.trim());
      setPhone(updates.phone);
      setAddress(updates.address);
      setAvatarUrl(updates.photoURL);

      setIsEditModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng lên Firebase!');
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Lỗi cập nhật', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (isDemo) {
      setIsPasswordModalVisible(false);
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Thành công (Demo)', 'Đã đổi mật khẩu demo thành công!');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      await currentUser.updatePassword(newPassword);
      setIsPasswordModalVisible(false);
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Thành công', 'Mật khẩu Firebase đã được cập nhật thành công!');
    } catch (error) {
      console.log('Update password error:', error);
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Yêu cầu bảo mật',
          'Vui lòng đăng xuất và đăng nhập lại trước khi đổi mật khẩu.'
        );
      } else {
        Alert.alert('Lỗi đổi mật khẩu', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          if (!isDemo) {
            await auth.signOut();
          }
          if (onLogout) onLogout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.userEmail}>{email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{isDemo ? 'Tài Khoản Demo' : 'Firebase Verified'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <TouchableOpacity onPress={openEditModal} style={styles.editBtnSmall}>
            <Ionicons name="create-outline" size={16} color="#f59e0b" />
            <Text style={styles.editBtnSmallText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="mail-outline" size={20} color="#38bdf8" />
          </View>
          <View style={styles.infoTextBox}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="call-outline" size={20} color="#34d399" />
          </View>
          <View style={styles.infoTextBox}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{phone}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="location-outline" size={20} color="#f472b6" />
          </View>
          <View style={styles.infoTextBox}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Bảo mật & Tài khoản</Text>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => setIsPasswordModalVisible(true)}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.infoIconBox, { backgroundColor: '#334155' }]}>
              <Ionicons name="key-outline" size={20} color="#fbbf24" />
            </View>
            <Text style={styles.actionText}>Đổi Mật Khẩu</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
          <View style={styles.actionLeft}>
            <View style={[styles.infoIconBox, { backgroundColor: '#451a1a' }]}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.actionText, { color: '#ef4444' }]}>
              Đăng Xuất
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập Nhật Thông Tin</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Họ và tên</Text>
              <TextInput
                style={styles.modalInput}
                value={editFullName}
                onChangeText={setEditFullName}
              />

              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.modalLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.modalLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.modalInput}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Nhập địa chỉ nhà/cơ quan"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.modalLabel}>Link ảnh đại diện (Online URL)</Text>
              <TextInput
                style={styles.modalInput}
                value={editAvatarUrl}
                onChangeText={setEditAvatarUrl}
                placeholder="https://..."
                placeholderTextColor="#64748b"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isPasswordModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi Mật Khẩu</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Mật khẩu mới (tối thiểu 6 ký tự)</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
            />

            <Text style={styles.modalLabel}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.saveBtnText}>Cập Nhật Mật Khẩu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#f59e0b',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 8,
  },
  roleBadge: {
    backgroundColor: '#0284c7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  editBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  editBtnSmallText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#f1f5f9',
    marginTop: 2,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  saveBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});
