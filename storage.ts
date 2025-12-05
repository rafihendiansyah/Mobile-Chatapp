// storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'CHAT_HISTORY_GLOBAL';

export async function saveChatHistory(data: any) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Gagal menyimpan history:', e);
  }
}

export async function loadChatHistory() {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.warn('Gagal membaca history:', e);
    return null;
  }
}
