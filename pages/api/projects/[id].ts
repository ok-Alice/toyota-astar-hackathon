import type { NextApiRequest, NextApiResponse } from 'next';
import { projectsDB } from 'db/projects';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  switch (req.method) {
    case 'GET':
      res.status(200).json(projectsDB.get(parseInt(id as string, 10)));
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
