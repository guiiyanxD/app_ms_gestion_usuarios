import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GRAPHQL_URL } from '@env';
import { tokenStorage } from '../auth/storage/token.storage';

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

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
