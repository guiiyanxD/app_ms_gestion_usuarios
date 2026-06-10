import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { StatusBar } from 'expo-status-bar';
import { apolloClient } from './src/core/api/apollo.client';
import RootNavigator from './src/core/navigation/RootNavigator';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <StatusBar style="dark" />
      <RootNavigator />
    </ApolloProvider>
  );
}
