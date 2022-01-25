import ReactDOM from 'react-dom';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ReactiveVar,
  makeVar,
} from '@apollo/client';
import jwt from 'jsonwebtoken';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme/index';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';

const token = jwt.sign({ user: 'app' }, 'super_secret', { algorithm: 'HS256' });
const mainRoot = document.getElementById('mainRoot');

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
  headers: {
    authorization: `Bearer ${token}`,
  },
});

// export type ActiveItem = {
//   past: string[]
//   present: string
//   future: string[]
// }

export const sidebarVisibleVar: ReactiveVar<Boolean> = makeVar<Boolean>(true);
export const focusbarVisibleVar: ReactiveVar<Boolean> = makeVar<Boolean>(false);
export const shortcutDialogVisibleVar: ReactiveVar<Boolean> =
  makeVar<Boolean>(false);
export const activeItemVar: ReactiveVar<Array<String>> = makeVar<Array<String>>(
  []
);
export const subtasksVisibleVar: ReactiveVar<{
  [key: string]: { [key: string]: boolean };
}> = makeVar<{ [key: string]: { [key: string]: boolean } }>({});

export const activeCalendarVar: ReactiveVar<Object> = makeVar<Object>({});

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <ApolloProvider client={client}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </ChakraProvider>,
  mainRoot
);
