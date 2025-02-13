import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>LiqData - Real-time Market Data</title>
        <link rel="icon" href="/logo.png" />
        <meta name="description" content="Real-time cryptocurrency market data and analysis" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 