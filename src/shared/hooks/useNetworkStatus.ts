import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    };

    check();

    const subscription = Network.addNetworkStateListener((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });

    return () => subscription.remove();
  }, []);

  return { isOffline };
}
