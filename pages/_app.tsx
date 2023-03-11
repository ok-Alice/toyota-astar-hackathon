import type { AppProps } from 'next/app';
import { Rajdhani } from '@next/font/google';
import { Provider as JotaiProvider, useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import Layout from 'components/Layout';

import 'styles/globals.scss';
import { Preloader } from 'components/Preloader';
import { useEffect } from 'react';
import {
  currentUserAtom,
  setCurrentUserAtom,
  USER_STORAGE_KEY
} from 'store/db';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700']
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const user = useAtomValue(currentUserAtom);
  const setUser = useSetAtom(setCurrentUserAtom);

  useEffect(() => {
    if (user) return;
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
      if (router.pathname === '/login') return;
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router, user, setUser]);

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
