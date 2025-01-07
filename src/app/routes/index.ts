import express from 'express';
import { AuthRouter } from '../modules/Auth/auth.routes';
import { UserRouter } from '../modules/User/user.routes';
import { eventRouter } from '../modules/event/event.route';
import path from 'path';
import { paypalRouter } from '../modules/paypal/paypal.route';
import { contactRouter } from '../modules/contact/contact.route';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouter,
  },
  {
    path: '/users',
    route: UserRouter,
  },
  {
    path: '/events',
    route: eventRouter,
  },
  {
    path: '/paypal',
    route: paypalRouter,
  },
  {
    path: '/contact',
    route: contactRouter,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
