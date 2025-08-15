// import { Request, Response } from 'express';
// import catchAsync from '../../utils/catchAsync';
// import { stripeService } from './stripe.service';
// import sendResponse from '../../utils/sendResponse';
// import httpStatus from 'http-status';

// const createSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user?.id;


//   const session = await stripeService.createSubscriptionPlan(userId,req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Stripe plane created successfully.',
//     data: session,
//   });
// });

// const getAllSubscriptionPlans = catchAsync(async (req: Request, res: Response) => {



//   const session = await stripeService.getAllSubscriptionPlans();

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Stripe plane retrieve  successfully.',
//     data: session,
//   });
// });
// const deleteSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
   
//   const {id}=req.body


//   const session = await stripeService.deleteSubscriptionPlan(id);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Stripe plane deleted successfully.',
//     data: session,
//   });
// });


// const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user?.id;
//   const { priceId, type,paymentId } = req.body;

//   if (!userId || !priceId || !type) {
//     return res.status(httpStatus.BAD_REQUEST).json({
//       success: false,
//       message: 'userId, priceId and type are required',
//     });
//   }

//   const session = await stripeService.createPaymentSession(priceId, userId, type,paymentId);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Stripe payment session created successfully.',
//     data: session,
//   });
// });

// const cancelUserSubscription = catchAsync(async (req: Request, res: Response) => {
//   const { checkoutSessionId } = req.body;

//   if (!checkoutSessionId) {
//     return res.status(httpStatus.BAD_REQUEST).json({
//       success: false,
//       message: 'checkoutSessionId is required',
//     });
//   }

//   const result = await stripeService.cancelSubscription(checkoutSessionId);

//   res.status(httpStatus.OK).json({
//     success: true,
//     message: 'Subscription cancelled successfully',
//     data: result,
//   });
// });

// export const stripeController = {
//   createPaymentSession,
//   cancelUserSubscription,
//   createSubscriptionPlan,
//   deleteSubscriptionPlan,
//   getAllSubscriptionPlans
// };












;
import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { subscriptionService } from "./stripe.service";
import catchAsync from "../../utils/catchAsync";


const createSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    console.log(payload)
    const subscriptionPlan = await subscriptionService.createSubscriptionIntoDb(
      payload
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subscription plan created successfully",
      data: subscriptionPlan,
    });
  }
);
const purchaseSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;   
    const userId = req.user?.id; 
    const subscriptionPlan = await subscriptionService.purchaseSubscription(
      payload,userId
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subscription plan purchase  successfully",
      data: subscriptionPlan,
    });
  }
);
const getAllSubscriptionPlans = catchAsync(
  async (req: Request, res: Response) => {
     const userId = req.user?.id; 

    const subscriptionPlan = await subscriptionService.getAllSubscriptionPlans(userId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subscription plan get  successfully",
      data: subscriptionPlan,
    });
  }
);


export const subscriptionController = {
  createSubscriptionPlan,
  purchaseSubscription,
  getAllSubscriptionPlans
};
