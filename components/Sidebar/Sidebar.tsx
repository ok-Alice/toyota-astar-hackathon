import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentAccountAtom } from 'store/substrateAccount';

import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';
import { Avatar } from 'components/ui-kit/Avatar';

import { Project } from 'db/projects';
import { projectsAtom, usersAtom } from 'store/db';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const router = useRouter();
  const currentAccount = useAtomValue(currentAccountAtom);
  const projects = useAtomValue(projectsAtom);
  const setProjects = useSetAtom(projectsAtom);
  const setUsers = useSetAtom(usersAtom);

  const projectId = router.query.id as string;

  const getProjects = useCallback(async () => {
    const response = await fetch('/api/projects');
    const apiProjects = (await response.json()) as Project[];
    setProjects(apiProjects);
  }, [setProjects]);

  const getUsers = useCallback(async () => {
    const response = await fetch('/api/users');
    const apiUsers = await response.json();
    console.log(apiUsers);
    setUsers(apiUsers);
  }, [setUsers]);

  useEffect(() => {
    if (!currentAccount) {
      return;
    }

    getProjects();
    getUsers();
  }, [setProjects, currentAccount, getProjects, getUsers]);

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
