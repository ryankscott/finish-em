import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";
import theme from "./theme";
import { getClient } from "./client";
import React from "react";

const container = document.getElementById("root");
const root = createRoot(container);

getClient().then((client) => {
  root.render(
    <ChakraProvider theme={theme}>
      <ApolloProvider client={client}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </ChakraProvider>,
  );
});
