import { NextComponentType } from 'next'
import '../styles/globals.css'

type AppInput = {
  Component: NextComponentType
  pageProps: any
}

function MyApp({ Component, pageProps }: AppInput) {
  return <Component {...pageProps} />
}

export default MyApp
