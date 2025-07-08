import express from 'express';
import { AuthRouter } from '../modules/auth/auth.routes';
import { UserRouter } from '../modules/user/user.routes';
import { eventRouter } from '../modules/event/event.route';
import path from 'path';
import { paypalRouter } from '../modules/paypal/paypal.route';
import { contactRouter } from '../modules/contact/contact.route';
import { squareRouter } from '../modules/square/square.route';
import { resourceRouter } from '../modules/resource/resource.route';
import { transactionRouter } from '../modules/transaction/transaction.route';
import { eventUsersRouter } from '../modules/eventUsers/eventUsers.route';
import { notificationRouter } from '../modules/notification/notification.route';
import { stripeRoute } from '../modules/stripe/stripe.route';
import { followRouter } from '../modules/follow/follow.route';
import { streamRoutes } from '../modules/stream/stream.route';
import { favouriteRouters } from '../modules/favourite/favourite.routes';
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
    path: '/stripe',
    route: stripeRoute,
  },
  {
    path: '/contact',
    route: contactRouter,
  },
  {
    path: '/square',
    route: squareRouter,
  },
  {
    path: '/resource',
    route: resourceRouter,
  },
  {
    path: '/transaction',
    route: transactionRouter,
  },
  {
    path: '/event-users',
    route: eventUsersRouter,
  },
  {
    path: '/notification',
    route: notificationRouter,
  },
  {
    path: '/notification',
    route: notificationRouter,
  },
  {
    path: '/follow',
    route: followRouter,
  },
  {
    path: '/stream',
    route: streamRoutes,
  },
  {
    path: '/favourite',
    route: favouriteRouters,
  },
  
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
