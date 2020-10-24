import * as React from "react";
import ReactDOM from "react-dom";
import ViewManager from "./components/ViewManager";
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const mainRoot = document.getElementById("mainRoot");

const client = new ApolloClient({
  uri: "http://localhost:8080/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Label: {
        keyFields: ["key"],
      },
      Feature: {
        keyFields: ["key"],
      },
    },
  }),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ViewManager />
      </PersistGate>
    </Provider>
  </ApolloProvider>,
  mainRoot
);
