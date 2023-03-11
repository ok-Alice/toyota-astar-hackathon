import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAtomValue } from 'jotai';
import { currentAccountAtom } from 'store/substrateAccount';

import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';
import { Avatar } from 'components/ui-kit/Avatar';

import { Project } from 'db/projects';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const router = useRouter();
  const currentAccount = useAtomValue(currentAccountAtom);
  // eventually populate this
  const projects: Project[] = [];

  const projectId = router.query.id as string;

  if (!currentAccount) {
    return null;
  }

  return (
    <aside className={styles.root}>
      <span className={styles['logo-container']}>
        <Link href="/">
          <span className={styles.logo}>
            <Image src="/logo/toyota-square.svg" alt="toyota-square" fill />
          </span>
        </Link>
      </span>

      <ul className={styles['center-container']}>
        {projects?.map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              active={!!projectId && parseInt(projectId, 10) === project.id}
              variant="nav"
            >
              <span className={styles['button-logo']}>
                <Avatar value={project.name} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles['bottom-container']}>
        <Link href="/create-project" variant="outlined">
          <Icon name="add" />
        </Link>
      </div>
    </aside>
  );
}
