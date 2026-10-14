import React from 'react'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from 'react-query'
import { HashRouter as Router } from 'react-router-dom'
import store from './store'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // staleTime: Infinity,
    },
  },
})

const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <Router>{children}</Router>
      </QueryClientProvider>
    </Provider>
  )
}

export default AppProviders
