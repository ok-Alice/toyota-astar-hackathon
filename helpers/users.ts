// users in JSON file for simplicity, store in a db for production applications
const users = require('data/users.json');

export type User = {
  email: string;
  password: string;
  displayName: string;
};

export const usersDB = {
  getByEmail: (email: string) => users.find((x: User) => x.email === email)
};
