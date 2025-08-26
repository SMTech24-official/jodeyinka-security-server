// import express from 'express';
// import { stripeController } from './stripe.controller';
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { stripeValidation } from './stripe.validation';
// const router = express.Router();

// router.post('/subscription', auth(), stripeController.createPaymentSession);
// router.get('/subscription_plan', auth(), stripeController.getAllSubscriptionPlans);
// router.post('/cancel-subscription',auth(), stripeController.cancelUserSubscription); // ✅ নতুন route
// router.post('/create-subscription', validateRequest(stripeValidation.subscriptionPlanValidation), auth(), stripeController.createSubscriptionPlan);
// router.delete('/delete-subscription', auth(), stripeController.deleteSubscriptionPlan);
// router.post('/cancel-subscription',auth(), stripeController.cancelUserSubscription); // ✅ নতুন route

// export const stripeRoute = router;







import { Router } from "express";
import auth from "../../middlewares/auth";


import { subscriptionController } from "./stripe.controller";



const router = Router();

router.post(
  "/create-subscription", 
//   validateRequest(subscriptionValidation.subscriptionSchema),
  auth(),
  subscriptionController.createSubscriptionPlan
);
router.post(
  "/purchase-subscription",
  auth(),
  subscriptionController.purchaseSubscription
);
router.get(
  "/get-subscription",
  auth(),
  subscriptionController.getAllSubscriptionPlans
);
router.get(
  "/me",
  auth(),
  subscriptionController.mySubscription
);
router.post(
  "/un-subscription",
  auth(),
  subscriptionController.unsubscribeSubscription
);
export const subscriptionRouter = router;
