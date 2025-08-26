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


// const createSubscriptionIntoDb = async (payload: any) => {
//   let product: Stripe.Product | null = null;
//   // let prices: Stripe.Price | null = null;
//   let price: any;

//   console.log(183)
//   console.log(payload)
//   if (payload.title !== SubscriptionType.FREE) {
//     product = await stripe.products.create({
//       name: payload.title,

//       default_price_data: {
//         currency: "usd",
//         unit_amount: Math.round(parseFloat(payload.price) * 100),
//         recurring: {
//           interval: payload.interval,
//           interval_count: payload.interval_count,
//         },
//       },
//       expand: ["default_price"],
//     });
//     if (!product) {
//       // throw new ApiError(httpStatus.NOT_FOUND, "product not crated");
//        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
//     }

//     price = product.default_price as Stripe.Price;
//   }

//   const subsription = await prisma.subscription.create({
//     data: {
//       features: payload.features,
//       price: payload.price as number,
//       productId: payload.title === SubscriptionType.FREE ? null : product?.id,
//       pricingId: payload.title === SubscriptionType.FREE ? null : price.id,
//       interval: payload.interval,
//       interval_count: payload.interval_count,
//       title: payload.title,
//     },
//   });
//   return subsription;
// };

const createSubscriptionIntoDb = async (payload: any) => {
  let product: Stripe.Product | null = null;
  let price: Stripe.Price | null = null;

  // Determine interval
  let interval: "month" | "year" | "lifetime" = "lifetime";
  if (["BASIC", "PREMIUM"].includes(payload.title)) interval = "year";

  if (payload.price > 0) {
    product = await stripe.products.create({
      name: payload.title,
      default_price_data: {
        currency: "usd",
        unit_amount: Math.round(payload.price * 100),
        recurring: interval === "lifetime" ? undefined : { interval },
      },
      expand: ["default_price"],
    });

    if (!product) throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Product creation failed");

    price = product.default_price as Stripe.Price;
  }

  // Save into DB
  const subscription = await prisma.subscription.create({
    data: {
      title: payload.title,
      price: payload.price,
      interval: interval,
      interval_count: 1,
      features: payload.features || [],
      productId: product?.id || null,
      pricingId: price?.id || null,
    },
  });

  return subscription;
};



// const getAllSubscriptionPlans = async (userId: string) => {
//   const user = await prisma.user.findUnique(
//     {
//       where :{
//         id: userId
//       }
//     }
//   )
//     if(!user) throw new AppError(httpStatus.NOT_FOUND, "user not found")
//       if(user.role === UserRoleEnum.SPONSOR) {
        
//   const subscription = await prisma.subscription.findMany({
//     where: {
//       title: SubscriptionType.LIFETIME
//     }
//   });
//   return subscription;

//       }

//   const subscription = await prisma.subscription.findMany({
//     where: {
//      NOT: {
//       title: "LIFETIME",
//     },
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });
//   return subscription;
// };

const getAllSubscriptionPlans = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (user.role === "SPONSOR") {
    // Sponsor sees yearly subscriptions
      const subscriptions = await prisma.subscription.findMany({
    where: { title: { in: ["BRONZE", "PREMIUM"] } },
    orderBy: { createdAt: "asc" },
  });

  // response modify করা: BRONZE → BASIC
  const modifiedResponse = subscriptions.map(sub => ({
    ...sub,
    title: sub.title === "BRONZE" ? "BASIC" : sub.title,
  }));

  return modifiedResponse;
  }

  // Members see lifetime plans
  return prisma.subscription.findMany({
    where: { title: { in: ["BRONZE", "GOLD", "SILVER", "PLATINUM"] } },
    orderBy: { createdAt: "asc" },
  });
};





interface PurchaseSubscriptionPayload {
  subscriptionId: string;
  paymentMethodId?: string; // Free plan হলে paymentMethodId optional
}
//   const purchaseSubscription = async (
//   payload: PurchaseSubscriptionPayload,
//   userId: string
// ) => {
//   // 1️⃣ Validate User
//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');


//   const userSubscription= await prisma.userSubscription.findFirst({where:{userId:userId}})
//    if (userSubscription) throw new AppError(httpStatus.UNAUTHORIZED, 'you have already subscribe please cancel first unsubscribe ');
//   // 2️⃣ Validate Subscription Plan
//   const subscriptionPlan = await prisma.subscription.findUnique({
//     where: { id: payload.subscriptionId },
//   });
//   if (!subscriptionPlan) throw new AppError(httpStatus.NOT_FOUND, 'Subscription plan not found');

//   // 3️⃣ Stripe Customer Creation (if needed)
//   let stripeCustomerId = user.stripeCustomerId;
//   const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userFullName;

//   if (!stripeCustomerId && subscriptionPlan.price > 0) {
//     const customer = await stripe.customers.create({ email: user.email, name: fullName });
//     stripeCustomerId = customer.id;
//     await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId } });
//   }

//   const isFreePlan = subscriptionPlan.price === 0;

//   // 4️⃣ Free Plan Handling
//   if (isFreePlan) {
//     return prisma.userSubscription.upsert({
//       where: { userId_subscriptionId: { userId, subscriptionId: subscriptionPlan.id } },
//       create: { userId, subscriptionId: subscriptionPlan.id, status: SubscriptionStatus.ACTIVE },
//       update: { status: SubscriptionStatus.ACTIVE },
//     });
//   }

//   // 5️⃣ Paid Plan Handling
//   if (!payload.paymentMethodId)
//     throw new AppError(httpStatus.BAD_REQUEST, 'Payment method is required for paid plans');

//   if (!subscriptionPlan.pricingId)
//     throw new AppError(httpStatus.BAD_REQUEST, 'Missing Stripe priceId for this plan');

//   // Attach payment method to customer
//   await stripe.paymentMethods.attach(payload.paymentMethodId, { customer: stripeCustomerId! });
//   await stripe.customers.update(stripeCustomerId!, {
//     invoice_settings: { default_payment_method: payload.paymentMethodId },
//   });

//   // Create Stripe subscription
//   const stripeSub = await stripe.subscriptions.create({
//     customer: stripeCustomerId!,
//     items: [{ price: subscriptionPlan.pricingId }],
//     metadata: { subscriptionId: subscriptionPlan.id, userId },
//     payment_settings: { payment_method_types: ['card'], save_default_payment_method: 'on_subscription' },
//     expand: ['latest_invoice'],
//   });

//   // Save in DB
//   return prisma.userSubscription.create({
//     data: {
//       userId,
//       subscriptionId: subscriptionPlan.id,
//       priceId: subscriptionPlan.pricingId,
//       subscriptionPayId: stripeSub.id,
//       status: SubscriptionStatus.ACTIVE,
//     },
//   });
// };


const purchaseSubscription = async (
  payload: PurchaseSubscriptionPayload,
  userId: string
) => {
  // 1️⃣ Validate User
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  // 2️⃣ Check if user already has a subscription
  const userSubscription = await prisma.userSubscription.findFirst({ where: { userId } });
  if (userSubscription)
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You have already subscribed. Please unsubscribe first.'
    );

  // 3️⃣ Validate Subscription Plan
  const subscriptionPlan = await prisma.subscription.findUnique({
    where: { id: payload.subscriptionId },
  });
  if (!subscriptionPlan) throw new AppError(httpStatus.NOT_FOUND, 'Subscription plan not found');

  // 4️⃣ Stripe Customer Creation (if needed)
  let stripeCustomerId = user.stripeCustomerId;
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userFullName;

  if (!stripeCustomerId && subscriptionPlan.price > 0) {
    const customer = await stripe.customers.create({ email: user.email, name: fullName||undefined });
    stripeCustomerId = customer.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId } });
  }

  const isFreePlan = subscriptionPlan.price === 0;

  // 5️⃣ Free Plan Handling
  if (isFreePlan) {
    return prisma.userSubscription.upsert({
      where: { userId_subscriptionId: { userId, subscriptionId: subscriptionPlan.id } },
      create: { userId, subscriptionId: subscriptionPlan.id, status: 'ACTIVE' },
      update: { status: 'ACTIVE' },
    });
  }

  // 6️⃣ Paid Plan Handling
  if (!payload.paymentMethodId)
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment method is required for paid plans');

  if (!subscriptionPlan.pricingId)
    throw new AppError(httpStatus.BAD_REQUEST, 'Missing Stripe priceId for this plan');

  // ✅ Check Stripe price type
  const stripePrice = await stripe.prices.retrieve(subscriptionPlan.pricingId);
  if (stripePrice.type !== 'recurring') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Stripe price type must be recurring for subscription.'
    );
  }

  // Attach payment method to customer
  await stripe.paymentMethods.attach(payload.paymentMethodId, { customer: stripeCustomerId! });
  await stripe.customers.update(stripeCustomerId!, {
    invoice_settings: { default_payment_method: payload.paymentMethodId },
  });

  // Create Stripe subscription
  const stripeSub = await stripe.subscriptions.create({
    customer: stripeCustomerId!,
    items: [{ price: subscriptionPlan.pricingId }],
    metadata: { subscriptionId: subscriptionPlan.id, userId },
    payment_settings: { payment_method_types: ['card'], save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice'],
  });

  // Save subscription in DB
  return prisma.userSubscription.create({
    data: {
      userId,
      subscriptionId: subscriptionPlan.id,
      priceId: subscriptionPlan.pricingId,
      subscriptionPayId: stripeSub.id,
      status: 'ACTIVE',
    },
  });
};



 const unsubscribeSubscription = async (userId: string, subscriptionId: string) => {
  // 1️⃣ Check user subscription
  const userSubscription = await prisma.userSubscription.findFirst({
    where: { userId, subscriptionId },
  });

  if (!userSubscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'User subscription not found');
  }

  // 2️⃣ Check subscription plan
  const subscriptionPlan = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscriptionPlan) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription plan not found');
  }

  // 3️⃣ Free Plan → শুধু DB থেকে delete
  if (subscriptionPlan.price === 0) {
    await prisma.userSubscription.delete({
      where: { userId_subscriptionId: { userId, subscriptionId } },
    });
    return { success: true, message: 'Free subscription removed successfully.' };
  }

  // 4️⃣ Paid Plan → Stripe cancel + DB delete
  if (!userSubscription.subscriptionPayId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No Stripe subscription ID found for this user.');
  }

  // Cancel subscription on Stripe
  await stripe.subscriptions.cancel(userSubscription.subscriptionPayId);

  // Delete from DB
  await prisma.userSubscription.delete({
    where: { userId_subscriptionId: { userId, subscriptionId } },
  });

  return { success: true, message: 'Paid subscription cancelled successfully.' };
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

// const handleSubscriptionSucceed = async (payload: any) => {
//   await prisma.userSubscription.update({
//     where: { subscriptionPayId: payload?.subscription },
//     data: { status: SubscriptionStatus.ACTIVE, priceId: payload.lines.data[0].price.id },
//   });
// };

const handleSubscriptionSucceed = async (payload: any) => {
  await prisma.userSubscription.updateMany({
    where: { subscriptionPayId: payload?.subscription },
    data: { 
      status: SubscriptionStatus.ACTIVE, 
      priceId: payload.lines.data[0].price.id 
    },
  });
};


// const failedCustomerSubscription = async (payload: any) => {
//   await prisma.userSubscription.update({
//     where: { subscriptionPayId: payload?.subscription },
//     data: { status: SubscriptionStatus.DEACTIVE },
//   });
// };

const failedCustomerSubscription = async (payload: any) => {
  await prisma.userSubscription.updateMany({
    where: { subscriptionPayId: payload?.subscription },
    data: { status: SubscriptionStatus.DEACTIVE },
  });
};



// const handleSubscriptionCreated = async (payload: any) => {
//   await prisma.userSubscription.upsert({
//     where: { subscriptionPayId: payload.id },
//     update: { status: SubscriptionStatus.ACTIVE, priceId: payload.items.data[0].price.id },
//     create: {
//       userId: payload.metadata.userId,
//       subscriptionId: payload.metadata.subscriptionId,
//       subscriptionPayId: payload.id,
//       priceId: payload.items.data[0].price.id,
//       status: SubscriptionStatus.ACTIVE,
//     },
//   });
// };

const handleSubscriptionCreated = async (payload: any) => {
  const existing = await prisma.userSubscription.findFirst({
    where: { subscriptionPayId: payload.id },
  });

  if (existing) {
    // update case
    await prisma.userSubscription.update({
      where: { id: existing.id }, // id সবসময় unique থাকে
      data: {
        status: SubscriptionStatus.ACTIVE,
        priceId: payload.items.data[0].price.id,
      },
    });
  } else {
    // create case
    await prisma.userSubscription.create({
      data: {
        userId: payload.metadata.userId,
        subscriptionId: payload.metadata.subscriptionId,
        subscriptionPayId: payload.id,
        priceId: payload.items.data[0].price.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }
};


const mySubscription = async (userId: any) => {
 
  return await prisma.userSubscription.findFirst({where:{userId},select:{subscription:true}})
};



export const subscriptionService = {
  createSubscriptionIntoDb,
  getAllSubscriptionPlans,
  purchaseSubscription,
  handleSubscriptionCreated,
  updateCustomerSubscription,
  handleSubscriptionSucceed,
  failedCustomerSubscription,
  unsubscribeSubscription,
  mySubscription
};
