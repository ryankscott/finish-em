import { createRoot } from 'react-dom/client';
import { ApolloProvider, ApolloClient, ApolloLink } from '@apollo/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import theme from './theme';
import { client, setLinkURL } from './client';

window.electronAPI.ipcRenderer.getSettings().then((settings) => {
  const { cloudSync } = settings;
  if (cloudSync.enabled) {
    setLinkURL('server');
    localStorage.setItem('token', cloudSync.token);
  }
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
