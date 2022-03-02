import ReactDOM from 'react-dom';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ReactiveVar,
  makeVar,
} from '@apollo/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import theme from './theme';

const root = document.getElementById('root');

export const sidebarVisibleVar: ReactiveVar<boolean> = makeVar<boolean>(true);
export const focusbarVisibleVar: ReactiveVar<boolean> = makeVar<boolean>(false);
export const shortcutDialogVisibleVar: ReactiveVar<boolean> =
  makeVar<boolean>(false);
export const activeItemVar: ReactiveVar<Array<string>> = makeVar<Array<string>>(
  []
);
export const subtasksVisibleVar: ReactiveVar<{
  [key: string]: { [key: string]: boolean };
}> = makeVar<{ [key: string]: { [key: string]: boolean } }>({});

export const activeCalendarVar: ReactiveVar<Object> = makeVar<Object>({});

const client = new ApolloClient({
  uri: 'http://localhost:8089/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Label: {
        keyFields: ['key'],
      },
      Feature: {
        keyFields: ['key'],
      },
      Project: {
        keyFields: ['key'],
      },
      Item: {
        keyFields: ['key'],
      },
      Area: {
        keyFields: ['key'],
      },
      View: {
        keyFields: ['key'],
      },
      Component: {
        keyFields: ['key'],
      },
      Query: {
        fields: {
          sidebarVisible: {
            read() {
              return sidebarVisibleVar();
            },
          },
          focusbarVisible: {
            read() {
              return focusbarVisibleVar();
            },
          },
          shortcutDialogVisible: {
            read() {
              return shortcutDialogVisibleVar();
            },
          },
          activeItem: {
            read() {
              return activeItemVar();
            },
          },
          subtasksVisible: {
            read() {
              return subtasksVisibleVar();
            },
          },
          activeCalendar: {
            read() {
              return activeCalendarVar();
            },
          },
        },
      },
    },
  }),
  headers: {},
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
