// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '../firebase';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Email dan password harus diisi');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Peringatan', 'Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMode('login');
        Alert.alert('Berhasil', 'Akun terdaftar. Silakan login.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Logo / Title */}
      <View style={styles.topSection}>
        <Text style={styles.logo}>Chat</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.formSection}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan email Anda"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Masukkan password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              editable={!loading}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {mode === 'register' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Konfirmasi Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ulangi password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Text style={styles.eyeIcon}>
                  {showConfirmPassword ? '👁' : '👁‍🗨'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>Password tidak cocok</Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Tunggu...' : mode === 'login' ? 'Login' : 'Register'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toggle Mode */}
      <View style={styles.bottomSection}>
        <Text style={styles.toggleText}>
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        </Text>
        <TouchableOpacity
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          disabled={loading}
        >
          <Text style={styles.toggleLink}>
            {mode === 'login' ? 'Daftar' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topSection: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  formSection: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeIcon: {
    fontSize: 18,
  },

  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },

  submitBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#bbb',
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomSection: {
    paddingBottom: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  toggleText: {
    fontSize: 13,
    color: '#666',
  },
  toggleLink: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
});
