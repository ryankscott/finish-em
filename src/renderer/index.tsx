import { createRoot } from 'react-dom/client';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import theme from './theme';
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
  <ChakraProvider theme={theme}>
    <ApolloProvider client={client}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </ChakraProvider>
);
