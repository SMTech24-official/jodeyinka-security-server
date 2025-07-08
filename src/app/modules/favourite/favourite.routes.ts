import express from 'express';
import auth from '../../middlewares/auth';


import validateRequest from '../../middlewares/validateRequest';

import { FavouriteValidation } from './favourite.validation';
import { FavouriteControllers } from './favourite.controller';



const router = express.Router();

router.post(
  '/',auth(),
  validateRequest(FavouriteValidation.favouriteValidation),
  FavouriteControllers.createFavouriteIntoDB,
);
router.get(
  '/:id',auth(),
  FavouriteControllers.getFavourite
);

export const favouriteRouters = router;
