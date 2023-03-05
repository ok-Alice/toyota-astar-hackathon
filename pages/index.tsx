import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Overview from 'components/Overview';
import {
  currentEmailAccountAtom,
  emailAccountStorageKey,
  setCurrentEmailAccountAtom
} from 'store/emailAccount';

export default function Home() {
  const router = useRouter();
  const emailAccount = useAtomValue(currentEmailAccountAtom);
  const setEmailAccount = useSetAtom(setCurrentEmailAccountAtom);

  useEffect(() => {
    if (emailAccount) return;
    const storedEmailAccount = localStorage.getItem(emailAccountStorageKey);
    if (!storedEmailAccount) {
      router.push('/login');
    } else {
      setEmailAccount(JSON.parse(storedEmailAccount));
    }
  }, [router, emailAccount, setEmailAccount]);

  return (
    <>
      <Head>
        <title>OkAlice DAO Projects app</title>
        <meta name="description" content="OKAlice DAO Projects App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {emailAccount ? <Overview /> : <div />}
    </>
  );
}
