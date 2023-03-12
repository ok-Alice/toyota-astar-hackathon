import type { Href } from 'types';

export function formLinkByProjectId(daoId: string, href: Href) {
  return `/projects/${daoId}/${href}`;
}
