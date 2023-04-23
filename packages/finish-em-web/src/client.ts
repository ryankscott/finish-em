import { queryCache } from "./cache";
import { HttpLink, concat, ApolloLink, ApolloClient } from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import {
  CLOUD_SERVER_URL,
  USER_GQL_OPERATIONS,
} from "@finish-em-mono/shared/consts";

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => {
    return {
      headers: {
        ...headers,
        "apollo-require-preflight": "true",
        "x-apollo-operation-name": operation.operationName,
        authorization: localStorage.getItem("token") || null,
      },
    };
  });
  return forward(operation);
});

const createLink = (serverURL: string) => {
  const retryLink = new RetryLink().split(
    (operation) => {
      return USER_GQL_OPERATIONS.includes(operation.operationName);
    },
    new HttpLink({
      uri: CLOUD_SERVER_URL,
    }),
    new HttpLink({ uri: serverURL })
  );

  return concat(authMiddleware, retryLink);
};

export const client = new ApolloClient({
  cache: queryCache,
  link: createLink(CLOUD_SERVER_URL),
});
