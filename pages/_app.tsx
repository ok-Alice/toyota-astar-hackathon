import type { AppProps } from 'next/app';
import { Rajdhani } from '@next/font/google';
import { Provider as JotaiProvider, useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import Layout from 'components/Layout';

import 'styles/globals.scss';
import { Preloader } from 'components/Preloader';
import { useEffect } from 'react';
import {
  currentEmailAccountAtom,
  emailAccountStorageKey,
  setCurrentEmailAccountAtom
} from 'store/emailAccount';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700']
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const emailAccount = useAtomValue(currentEmailAccountAtom);
  const setEmailAccount = useSetAtom(setCurrentEmailAccountAtom);

  useEffect(() => {
    if (emailAccount) return;
    const storedEmailAccount = localStorage.getItem(emailAccountStorageKey);

    if (!storedEmailAccount) {
      if (router.pathname === '/login') return;
      router.push('/login');
    } else {
      setEmailAccount(JSON.parse(storedEmailAccount));
    }
  }, [router, emailAccount, setEmailAccount]);

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
