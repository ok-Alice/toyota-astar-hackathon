import type { AppProps } from 'next/app';
import { Rajdhani } from '@next/font/google';
import { Provider as JotaiProvider } from 'jotai';
import { useRouter } from 'next/router';
import Layout from 'components/Layout';

import 'styles/globals.scss';
import Preloader from 'components/Preloader';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700']
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <style jsx global>{`
        :root {
          --rajdhani-font: ${rajdhani.style.fontFamily};
        }
      `}</style>
      <JotaiProvider>
        {router.pathname === '/login' ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Preloader />
            <Component {...pageProps} />
          </Layout>
        )}
      </JotaiProvider>
    </>
  );
}
