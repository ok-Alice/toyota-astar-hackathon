import { Header } from 'components/Header';
import { ReactNode } from 'react';

import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className={styles.root}>{children}</main>
    </>
  );
}
