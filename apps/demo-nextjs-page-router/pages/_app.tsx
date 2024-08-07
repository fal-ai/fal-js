import { AppProps } from "next/app";
import Head from "next/head";
import "./styles.css";

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to demo-app!</title>
      </Head>
      <main className="app dark">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
