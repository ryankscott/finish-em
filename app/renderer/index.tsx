import * as React from 'react'
import ReactDOM from 'react-dom'
import ViewManager from './components/ViewManager'
import { ApolloProvider, ApolloClient, InMemoryCache, ReactiveVar, makeVar } from '@apollo/client'
import jwt from 'jsonwebtoken'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme/index'

const token = jwt.sign({ user: 'app' }, 'super_secret', { algorithm: 'HS256' })
const mainRoot = document.getElementById('mainRoot')

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
              return sidebarVisibleVar()
            },
          },
          theme: {
            read() {
              return themeVar()
            },
          },
          focusbarVisible: {
            read() {
              return focusbarVisibleVar()
            },
          },
          shortcutDialogVisible: {
            read() {
              return shortcutDialogVisibleVar()
            },
          },
          activeItem: {
            read() {
              return activeItemVar()
            },
          },
          subtasksVisible: {
            read() {
              return subtasksVisibleVar()
            },
          },
          activeCalendar: {
            read() {
              return activeCalendarVar()
            },
          },
        },
      },
    },
  }),
  headers: {
    authorization: `Bearer ${token}`,
  },
})

// export type ActiveItem = {
//   past: string[]
//   present: string
//   future: string[]
// }

export const sidebarVisibleVar: ReactiveVar<Boolean> = makeVar<Boolean>(true)
export const focusbarVisibleVar: ReactiveVar<Boolean> = makeVar<Boolean>(false)
export const shortcutDialogVisibleVar: ReactiveVar<Boolean> = makeVar<Boolean>(false)
export const activeItemVar: ReactiveVar<Array<String>> = makeVar<Array<String>>([])
export const themeVar: ReactiveVar<String> = makeVar<String>('light')
export const subtasksVisibleVar: ReactiveVar<Object> = makeVar<Object>({})
export const activeCalendarVar: ReactiveVar<Object> = makeVar<String>('')

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <ApolloProvider client={client}>
      <ViewManager />
    </ApolloProvider>
  </ChakraProvider>,
  mainRoot,
)
