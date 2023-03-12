import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { Header } from 'components/Header';
import { Sidebar } from 'components/Sidebar';
import { CloseButton } from 'components/ui-kit/Notifications';
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
      <ToastContainer
        position="top-right"
        icon={false}
        autoClose={3000}
        hideProgressBar
        pauseOnFocusLoss
        pauseOnHover
        closeOnClick={false}
        rtl={false}
        newestOnTop={false}
        draggable={false}
        closeButton={CloseButton}
      />
    </>
  );
}
