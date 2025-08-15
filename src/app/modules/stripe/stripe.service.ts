// import Stripe from 'stripe';
// import dotenv from 'dotenv';
// import prisma from '../../utils/prisma';
// import httpStatus from 'http-status';
// import AppError from '../../errors/AppError';

// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SK_KEY as string,);

// interface CreatePlanInput {
//   name: string;
//   amount: number;
//   currency?: string;
//   interval?: "month" | "year" | "lifetime"; // interval type
//   paymentType?: string;
// }

// const createSubscriptionPlan = async (userId: string, data: CreatePlanInput) => {
//   const { name, amount, currency = "usd", interval = "month", paymentType = "Stripe" } = data;


//     const isName=await  prisma.subscription_Plan.findFirst({where:{name}})
//    if (isName) {
//         throw new AppError(httpStatus.UNAUTHORIZED, 'plan is already exist!');
//       }

//   // Step 1: Stripe Product তৈরি
//   const product = await stripe.products.create({ name });

//   let price;

//   if (interval === "lifetime") {
//     // Step 2a: Lifetime price (non-recurring)
//     price = await stripe.prices.create({
//       unit_amount: amount,
//       currency,
//       product: product.id,
//     });
//   } else {
//     // Step 2b: Monthly or Yearly recurring
//     price = await stripe.prices.create({
//       unit_amount: amount,
//       currency,
//       recurring: { interval }, // "month" or "year"
//       product: product.id,
//     });
//   }

//   // Step 3: DB এ save
//   const plan = await prisma.subscription_Plan.create({
//     data: {
//       userId,
//       name,
//       priceId: price.id,
//       paymentType,
//       interval,
//     },
//   });

//   return plan;
// };


// const getAllSubscriptionPlans = async () => {
//   const plans = await prisma.subscription_Plan.findMany({
//     where:{active:true},
//     include: {
//       user: true, // ইউজারের ডিটেইল সহ fetch করতে চাইলে
//     },
//     orderBy: {
//       createdAt: "desc", // নতুন প্ল্যান আগে দেখাবে
//     },
//   });

//   return plans;
// };


// const deleteSubscriptionPlan = async (id: string) => {
//   // Step 1: DB থেকে প্ল্যান খুঁজে বের করা
//   const plan = await prisma.subscription_Plan.findUnique({
//     where: { id },
//   });

//   if (!plan) {
//     throw new Error("Subscription plan not found");
//   }

//   // Step 2: Transaction শুরু
//   const deletedPlan = await prisma.$transaction(async (tx) => {
//     // Stripe price inactive
//     await stripe.prices.update(plan.priceId, { active: false });

//     // DB delete
//     const deleted = await tx.subscription_Plan.delete({
//       where: { id },
//     });

//     return deleted;
//   });

//   return deletedPlan;
// };



// const createPaymentSession = async (
//   priceId: string,
//   userId: string,
//   type: string,
//   paymentId:string
// ) => {
//   console.log("createPaymentSession")

//   console.log(userId,'hello')
//   const session = await stripe.checkout.sessions.create({
//     mode: 'subscription',
//     payment_method_types: ['card'],
//     line_items: [
//       {
//         price: priceId,
//         quantity: 1,
//       },
//     ],
//     metadata: {
//       userId,
//       type,
//     },
//     success_url: `https://facebook.com`,
//     cancel_url: `https://facebook.com`,
//   });

//   return session;
// };



// const cancelSubscription = async (checkoutSessionId: string) => {
//   // Checkout session থেকে subscription ID রিট্রিভ করা
//   // const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

//   // const subscriptionId = session.subscription as string;
//   // if (!subscriptionId) {
//   //   throw new Error('No subscription found for this session.');
//   // }

//   // Subscription ক্যানসেল করা
//   const cancelled = await stripe.subscriptions.cancel(checkoutSessionId);
//   return cancelled;
// };

// export const stripeService = {
//   createPaymentSession,
//   cancelSubscription,
//   createSubscriptionPlan,
//   deleteSubscriptionPlan,
//   getAllSubscriptionPlans
// };






import Stripe from "stripe";


import { SubscriptionStatus, SubscriptionType, UserRoleEnum } from "@prisma/client";

 import httpStatus from 'http-status';
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";

const stripe = new Stripe(process.env.STRIPE_SK_KEY as string,);


const createSubscriptionIntoDb = async (payload: any) => {
  let product: Stripe.Product | null = null;
  // let prices: Stripe.Price | null = null;
  let price: any;

  console.log(183)
  console.log(payload)
  if (payload.title !== SubscriptionType.FREE) {
    product = await stripe.products.create({
      name: payload.title,

      default_price_data: {
        currency: "usd",
        unit_amount: Math.round(parseFloat(payload.price) * 100),
        recurring: {
          interval: payload.interval,
          interval_count: payload.interval_count,
        },
      },
      expand: ["default_price"],
    });
    if (!product) {
      // throw new ApiError(httpStatus.NOT_FOUND, "product not crated");
       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    price = product.default_price as Stripe.Price;
  }

  const subsription = await prisma.subscription.create({
    data: {
      features: payload.features,
      price: payload.price as number,
      productId: payload.title === SubscriptionType.FREE ? null : product?.id,
      pricingId: payload.title === SubscriptionType.FREE ? null : price.id,
      interval: payload.interval,
      interval_count: payload.interval_count,
      title: payload.title,
    },
  });
  return subsription;
};

const getAllSubscriptionPlans = async (userId: string) => {
  const user = await prisma.user.findUnique(
    {
      where :{
        id: userId
      }
    }
  )
    if(!user) throw new AppError(httpStatus.NOT_FOUND, "user not found")
      if(user.role === UserRoleEnum.SPONSOR) {
        
  const subscription = await prisma.subscription.findMany({
    where: {
      title: SubscriptionType.LIFETIME
    }
  });
  return subscription;

      }

  const subscription = await prisma.subscription.findMany({
    where: {
     NOT: {
      title: "LIFETIME",
    },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return subscription;
};
const purchaseSubscription = async (
  payload: any,
  userId: string,
  // email: string,
  // fullName: string,
  // stripeCustomerId?: string
) => {
  const [user, subscriptionPlan ] = await prisma.$transaction([
    prisma.user.findUnique(
    {
      where :{
        id: userId
      }
    }
  ),
  prisma.subscription.findUnique({
    where: { id: payload.subscriptionId },
  })
  ]);

    if (!subscriptionPlan) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found");
  }
  if(!user) throw new AppError(httpStatus.NOT_FOUND, "user not found")

let  {email, firstName, lastName, userFullName,  stripeCustomerId} = user;

  const fullName = firstName && lastName ? firstName + " " + lastName : userFullName;
 
  const activeSubscription = await prisma.userSubscription.findFirst({
    where: { userId, status: SubscriptionStatus.ACTIVE },
    include: { subscription: true },
  });

 
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: email , name: fullName as string });
    stripeCustomerId = customer.id;
  }

 
  await stripe.paymentMethods.attach(payload.paymentMethodId, {
    customer: stripeCustomerId,
  });
  await stripe.customers.update(stripeCustomerId, {
    invoice_settings: { default_payment_method: payload.paymentMethodId },
  });

  const isFreePlan = subscriptionPlan.title === SubscriptionType.FREE;

  if (isFreePlan) {
  
    const existingFree = await prisma.userSubscription.findFirst({
      where: { userId, subscriptionId: subscriptionPlan.id },
    });

    if (existingFree) {
      return await prisma.userSubscription.update({
        where: { id: existingFree.id },
        data: { status: SubscriptionStatus.ACTIVE },
      });
    }

    return await prisma.userSubscription.create({
      data: { userId, subscriptionId: subscriptionPlan.id, status: SubscriptionStatus.ACTIVE },
    });
  }

  if (!subscriptionPlan.pricingId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Paid plan is missing Stripe priceId"
    );
  }


  const existingStripeSubs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
  });
  const existingStripe = existingStripeSubs.data[0];

  let stripeSub: Stripe.Subscription;

  if (existingStripe) {
 
    stripeSub = await stripe.subscriptions.update(existingStripe.id, {
      items: [{ id: existingStripe.items.data[0].id, price: subscriptionPlan.pricingId }],
      metadata: { priceId: subscriptionPlan.pricingId, subscriptionId: subscriptionPlan.id, userId },
      proration_behavior: "create_prorations",
    });

   
    await prisma.userSubscription.update({
      where: { subscriptionPayId: existingStripe.id },
      data: {
        priceId: subscriptionPlan.pricingId,
        subscriptionId: subscriptionPlan.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

  } else {
   
    stripeSub = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: subscriptionPlan.pricingId }],
      metadata: { priceId: subscriptionPlan.pricingId, subscriptionId: subscriptionPlan.id, userId },
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice"],
    });

   
    await prisma.userSubscription.create({
      data: {
        userId,
        subscriptionId: subscriptionPlan.id,
        priceId: subscriptionPlan.pricingId,
        subscriptionPayId: stripeSub.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }
};


const updateCustomerSubscription = async (payload: any) => {
  const currentSub = await prisma.userSubscription.findFirst({
    where: { subscriptionPayId: payload.id },
  });
  if (!currentSub) return;

  const newPriceId = payload.items.data[0].price.id;

  // Only update if price changes
  if (currentSub.priceId !== newPriceId) {
    await prisma.userSubscription.update({
      where: { id: currentSub.id },
      data: { priceId: newPriceId, subscriptionId: payload.metadata.subscriptionId },
    });
  }
};

const handleSubscriptionSucceed = async (payload: any) => {
  await prisma.userSubscription.update({
    where: { subscriptionPayId: payload.subscription },
    data: { status: SubscriptionStatus.ACTIVE, priceId: payload.lines.data[0].price.id },
  });
};

const failedCustomerSubscription = async (payload: any) => {
  await prisma.userSubscription.update({
    where: { subscriptionPayId: payload.subscription },
    data: { status: SubscriptionStatus.DEACTIVE },
  });
};

const handleSubscriptionCreated = async (payload: any) => {
  await prisma.userSubscription.upsert({
    where: { subscriptionPayId: payload.id },
    update: { status: SubscriptionStatus.ACTIVE, priceId: payload.items.data[0].price.id },
    create: {
      userId: payload.metadata.userId,
      subscriptionId: payload.metadata.subscriptionId,
      subscriptionPayId: payload.id,
      priceId: payload.items.data[0].price.id,
      status: SubscriptionStatus.ACTIVE,
    },
  });
};


export const subscriptionService = {
  createSubscriptionIntoDb,
  getAllSubscriptionPlans,
  purchaseSubscription,
  handleSubscriptionCreated,
  updateCustomerSubscription,
  handleSubscriptionSucceed,
  failedCustomerSubscription,
};
