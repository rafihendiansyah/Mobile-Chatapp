// screens/ChatScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import {
  auth,
  messagesCollection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  uploadImageAsync,
  signOut,
} from '../firebase';

import { saveChatHistory, loadChatHistory } from '../storage';

import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

type MessageType = {
  id: string;
  text: string;
  user: string;
  imageUrl?: string | null;
};

export default function ChatScreen() {
  const userEmail = auth.currentUser?.email || 'User';
  const userId = auth.currentUser?.uid || 'anon';

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Load offline history GLOBAL
  useEffect(() => {
    (async () => {
      const stored = await loadChatHistory();
      if (stored) setMessages(stored);
    })();
  }, []);

  // 2. Listener realtime Firestore
  useEffect(() => {
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, async snapshot => {
      const list: MessageType[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as any;
        list.push({
          id: doc.id,
          text: data.text ?? '',
          user: data.user ?? '',
          imageUrl: data.imageUrl ?? null,
        });
      });
      setMessages(list);
      await saveChatHistory(list);
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await addDoc(messagesCollection, {
        text: message,
        user: userEmail,
        userId,
        imageUrl: null,
        createdAt: serverTimestamp(),
      });
      setMessage('');
    } catch (e) {
      console.warn('Gagal kirim pesan:', e);
    } finally {
      setSending(false); // supaya tombol kembali "Kirim"
    }
  };

  const sendImage = async () => {
    setUploading(true);

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
      });

      if (!result.assets || !result.assets[0].uri) {
        Alert.alert('Info', 'Gambar belum dipilih');
        setUploading(false);
        return;
      }

      let uri = result.assets[0].uri;
      const fileName = result.assets[0].fileName || `photo_${Date.now()}.jpg`;

      console.log('🖼️ Image URI dari picker:', uri);
      console.log('🖼️ File name:', fileName);

      // Handle content:// URI by copying to cache
      if (uri.startsWith('content://')) {
        console.log('⚠️ Detected content:// URI, copying to cache...');
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        // Copy dari content:// ke local cache
        try {
          await RNFS.copyFile(uri, cachePath);
          uri = cachePath;
          console.log('✅ File copied to cache:', cachePath);
        } catch (copyError) {
          console.error('❌ Copy error:', copyError);
          throw new Error(
            `Cannot access image. Please try again or use a different photo.`,
          );
        }
      }

      const storagePath = `images/${userId}/${Date.now()}.jpg`;

      console.log('📤 Mulai upload gambar');
      console.log('📤 URI:', uri);
      console.log('📤 Path di Storage:', storagePath);

      const url = await uploadImageAsync(uri, storagePath);
      console.log('URL gambar dari Firebase:', url);

      await addDoc(messagesCollection, {
        text: '',
        user: userEmail,
        userId,
        imageUrl: url,
        createdAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error upload/kirim gambar:', error);
      const errorMsg = error?.message || JSON.stringify(error);
      Alert.alert('Gagal Upload', `Error: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isMe = item.user === userEmail;

    return (
      <View style={[styles.msgBox, isMe ? styles.myMsg : styles.otherMsg]}>
        <Text style={styles.sender}>{item.user}</Text>
        {item.text ? (
          <Text style={[styles.msgText, isMe && styles.myMsgText]}>
            {item.text}
          </Text>
        ) : null}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: 200,
              height: 200,
              marginTop: 8,
              borderRadius: 10,
              backgroundColor: '#eee',
            }}
            resizeMode="cover"
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Chat</Text>
          <Text style={styles.headerSubtitle}>{userEmail}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />

      {/* Input Area */}
      <View style={styles.bottomContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.iconBtn, uploading && styles.iconBtnDisabled]}
            onPress={sendImage}
            disabled={uploading}
          >
            <Text style={styles.iconText}>+</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (sending || !message.trim()) && styles.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={sending || !message.trim()}
          >
            <Text style={styles.sendBtnText}>{sending ? '...' : '→'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e3f2fd',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },

  // Message List
  messageList: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  // Message Bubble
  msgBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: '85%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  myMsg: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  otherMsg: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  sender: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 11,
    color: '#666',
  },
  msgText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
  myMsgText: {
    color: '#fff',
  },

  // Bottom Container
  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },

  // Icon Button
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnDisabled: {
    backgroundColor: '#bbb',
    opacity: 0.6,
  },
  iconText: {
    fontSize: 20,
  },

  // Input Field
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: '#f9f9f9',
    fontSize: 14,
    maxHeight: 100,
    color: '#000',
  },

  // Send Button
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  sendBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
