import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { tokenStorage } from '../auth/storage/token.storage';

const httpLink = createHttpLink({
  uri: process.env.EXPO_PUBLIC_GRAPHQL_URL,
});

const authLink = setContext(async (_, { headers }) => {
  const session = await tokenStorage.get();
  return {
    headers: {
      ...headers,
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
