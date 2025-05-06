import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Alert, Modal,
  Image, Pressable, TextInput
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function SettingsScreen() {
  const user = auth().currentUser;
  const displayName = user?.displayName || 'User';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  const handleLogout = async () => {
    try {
      await auth().signOut();
      setShowLogoutModal(false);
    } catch (error) {
      Alert.alert('Logout failed', error.message);
    }
  };

  const handleChangeName = async () => {
    try {
      await user.updateProfile({ displayName: newName });
      Alert.alert('Name updated');
      setShowNameModal(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPass !== confirmNewPass) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const credential = auth.EmailAuthProvider.credential(user.email, currentPass);
    try {
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPass);
      Alert.alert('Password changed successfully');
      setShowPasswordModal(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Image
        source={{ uri: 'https://i.pravatar.cc/100' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{user?.displayName || 'User'}</Text>

      <TouchableOpacity style={styles.row} onPress={() => setShowNameModal(true)}>
        <Text style={styles.label}>Change display name</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => setShowPasswordModal(true)}>
        <Text style={styles.label}>Change password</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Text style={styles.label}>My reviews</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => setShowLogoutModal(true)}>
        <Text style={[styles.label, { color: 'red' }]}>Log Out</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {/* Logout Modal */}
      <Modal transparent visible={showLogoutModal} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancel} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={handleLogout}>
                <Text style={styles.modalConfirmText}>Log out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Name Modal */}
      <Modal transparent visible={showNameModal} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change display name</Text>
            <TextInput
              placeholder="Enter Name"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancel} onPress={() => setShowNameModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={handleChangeName}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal transparent visible={showPasswordModal} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change password</Text>
            <TextInput
              placeholder="Enter Current Password"
              value={currentPass}
              onChangeText={setCurrentPass}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Enter New Password"
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Confirm New Password"
              value={confirmNewPass}
              onChangeText={setConfirmNewPass}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancel} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={handleChangePassword}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 8,
    backgroundColor: '#eaeaea',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3366ff',
    marginRight: 10,
  },
  modalCancelText: {
    color: '#3366ff',
  },
  modalConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#3366ff',
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
});
