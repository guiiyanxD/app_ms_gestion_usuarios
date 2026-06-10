import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from './theme';

interface Props {
  readonly visible: boolean;
}

export default function NetworkBanner({ visible }: Props) {
  const translateY = useRef(new Animated.Value(-48)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -48,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <Text style={styles.text}>Sin conexión a internet</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: colors.error,
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
