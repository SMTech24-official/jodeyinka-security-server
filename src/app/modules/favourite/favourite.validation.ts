import { z } from 'zod';

const favouriteValidation = z.object({
  body: z.object({
    favouriteUserId: z.string({
      required_error: 'favourite user  ID is required!',
    }),
    userId: z.string({
      required_error: 'favourite user  ID is required!',
    }),
  }),
});

export const FavouriteValidation = { favouriteValidation };
