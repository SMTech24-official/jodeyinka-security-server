import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config(); // ⬅️ VERY IMPORTANT


const stripe = new Stripe(process.env.STRIPE_SK_KEY as string,);

const createPaymentSession = async (
  priceId: string,
  userId: string,
  type: string
) => {
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
      type, // transaction type (e.g., 'MEMBERSHIP', 'SUBSCRIPTION', etc.)
    },
    success_url: `${process.env.CLIENT_BASE_URL}/payment/success`,
    cancel_url: `${process.env.CLIENT_BASE_URL}/payment/cancel`,
  });

  return session;
};

export const stripeService = {
  createPaymentSession,
};
