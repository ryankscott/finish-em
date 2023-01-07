import { queryCache } from './cache';
import { HttpLink, concat, ApolloLink, ApolloClient } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { CLOUD_SERVER_URL, GRAPHQL_PORT, USER_GQL_OPERATIONS } from 'consts';

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: localStorage.getItem('token') || null,
    },
  }));
  return forward(operation);
});

const createLink = (serverURL: string) => {
  const retryLink = new RetryLink().split(
    (operation) => {
      return USER_GQL_OPERATIONS.includes(operation.operationName);
    },
    new HttpLink({ uri: CLOUD_SERVER_URL }),
    new HttpLink({ uri: serverURL })
  );

  return concat(authMiddleware, retryLink);
};

export const setLinkURL = (server: 'local' | 'server') => {
  if (server == 'server') {
    client.setLink(createLink(CLOUD_SERVER_URL));
  } else {
    client.setLink(createLink(`http://localhost:${GRAPHQL_PORT}`));
  }
};

export const client = new ApolloClient({
  cache: queryCache,
  link: createLink(`http://localhost:${GRAPHQL_PORT}`),
});
