import type { NextApiRequest, NextApiResponse } from 'next';
import { User, usersDB } from 'helpers/users';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  const foundUser: User = usersDB.getByEmail(email);

  switch (req.method) {
    case 'POST':
      // Check given credentials
      if (foundUser) {
        if (foundUser.password === password) {
          res.status(200).json({
            displayName: foundUser.displayName,
            email: foundUser.email
          });
        } else {
          res.status(401).json({ message: 'Invalid email or password.' });
        }
      } else {
        res
          .status(404)
          .json({ message: `User with email ${email} not found.` });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
