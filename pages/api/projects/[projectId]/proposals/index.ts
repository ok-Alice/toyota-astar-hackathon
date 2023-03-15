import type { NextApiRequest, NextApiResponse } from 'next';
import { proposalDB } from 'db/proposals';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = parseInt(req.query.projectId as string, 10);

  switch (req.method) {
    case 'GET':
      res.status(200).json(proposalDB.list(projectId));
      break;
    case 'POST':
      // eslint-disable-next-line no-case-declarations
      const { name, description, createdAtBlock } = req.body;
      res
        .status(201)
        .json(
          proposalDB.create(
            name,
            description,
            projectId,
            createdAtBlock as number
          )
        );
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
