import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'gestion.session';

export interface StoredSession {
  readonly token: string;
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: string;
}

export const tokenStorage = {
  async save(session: StoredSession): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },

  async get(): Promise<StoredSession | null> {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
