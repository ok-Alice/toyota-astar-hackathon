import { useSetAtom } from 'jotai';
import { useRouter } from 'next/router';

import { Button } from 'components/ui-kit/Button';
import { disconnectEmailAccountAtom } from 'store/emailAccount';
import { disconnectSubstrateAccountAtom } from 'store/substrateAccount';
import styles from './Header.module.scss';
import Image from 'next/image';

export function Header() {
  const router = useRouter();
  const signOutEmail = useSetAtom(disconnectEmailAccountAtom);
  const signOutSubstrateAccount = useSetAtom(disconnectSubstrateAccountAtom);
  const handleSignOut = () => {
    signOutEmail();
    signOutSubstrateAccount();
    router.push('/login');
  };

  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <div className={styles.leftContainer}>
          <Image src="/logo/toyota.svg" alt="Toyota" width={1} height={1} />
          <Image src="/logo/astar.png" alt="Toyota" width={500} height={250} />
        </div>
        <div className={styles.rightContainer}>
          <Button>Connect Wallet</Button>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    </header>
  );
}
