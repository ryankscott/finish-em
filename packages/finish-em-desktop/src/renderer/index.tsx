import { createRoot } from 'react-dom/client';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@finish-em-mono/shared/components/App';
import { queryCache } from './cache';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: queryCache,
});

// eslint-disable-next-line import/prefer-default-export
export const legacyClient = new ApolloClient({
  uri: 'http://localhost:8089/graphql',
  cache: queryCache,
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
);
