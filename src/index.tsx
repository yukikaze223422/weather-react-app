import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import Header from "./components/header";
import Footer from "./components/footer";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <ChakraProvider>
    <Header />
    <App />
    <Footer />
  </ChakraProvider>
);
