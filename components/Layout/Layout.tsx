import { Header } from 'components/Header';
import { Sidebar } from 'components/Sidebar';
import { ReactNode } from 'react';

import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Sidebar />
      <main className={styles.root}>{children}</main>
    </>
  );
}
