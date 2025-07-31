import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SK_KEY as string,);

const createPaymentSession = async (
  priceId: string,
  userId: string,
  type: string
) => {
  console.log("createPaymentSession")
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      type,
    },
    success_url: `${process.env.CLIENT_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_BASE_URL}/payment/cancel`,
  });

  return session;
};

const cancelSubscription = async (checkoutSessionId: string) => {
  // Checkout session থেকে subscription ID রিট্রিভ করা
  // const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

  // const subscriptionId = session.subscription as string;
  // if (!subscriptionId) {
  //   throw new Error('No subscription found for this session.');
  // }

  // Subscription ক্যানসেল করা
  const cancelled = await stripe.subscriptions.cancel(checkoutSessionId);
  return cancelled;
};

export const stripeService = {
  createPaymentSession,
  cancelSubscription,
};
