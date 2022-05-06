import ReactDOM from 'react-dom';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import theme from './theme';
import { queryCache } from './cache';

const root = document.getElementById('root');

// eslint-disable-next-line import/prefer-default-export
export const apolloServerClient = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: queryCache,
});

const client = new ApolloClient({
  uri: 'http://localhost:8089/graphql',
  cache: queryCache,
});

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <ApolloProvider client={client}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </ChakraProvider>,
  root
);
