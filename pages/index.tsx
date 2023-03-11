import { useAtomValue } from 'jotai';
import Head from 'next/head';

import { setCurrentSubstrateAccountAtom } from 'store/substrateAccount';
import Overview from 'components/Overview';
import { Hero } from 'components/Hero';

export default function Home() {
  const currentSubstrateAccount = useAtomValue(setCurrentSubstrateAccountAtom);

  return (
    <>
      <Head>
        <title>OkAlice DAO Projects app</title>
        <meta name="description" content="OKAlice DAO Projects App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {currentSubstrateAccount ? <Overview /> : <Hero />}
    </>
  );
}
