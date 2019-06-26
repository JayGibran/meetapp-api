import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Jay Gibran',
    email: 'jaygibran@gmail.com',
    password_hash: '123456789',
  });
  console.log(user);
  res.json(user);
});

export default routes;
