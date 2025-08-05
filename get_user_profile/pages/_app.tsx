import React from "react";
import { AppProps } from "next/app";
import "../styles/main.css";
import { AuthProvider } from "../src/AuthContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
