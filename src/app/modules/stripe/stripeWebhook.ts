import Stripe from 'stripe';
import prisma from '../../utils/prisma';
import dotenv from 'dotenv';
dotenv.config(); // ⬅️ VERY IMPORTANT


const stripe = new Stripe(process.env.STRIPE_SK_KEY as string);

export const stripeWebhookHandler = async (req: any, res: any) => {
  console.log('hit webhook')
  const sig = req.headers['stripe-signature'] ;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.webhook_secret as string
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
console.log(event,'event')
  if (event.type === 'checkout.session.completed') {
    const session:any = event.data.object as Stripe.Checkout.Session;
    const userId:any = session.metadata?.userId;
    const type:any = session.metadata?.type 

    if (!userId || !type) {
      return res.status(400).json({ error: 'Missing metadata: userId or type' });
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const amount = subscription.items.data[0].price.unit_amount! / 100;
      const currency = subscription.items.data[0].price.currency;

      // Create transaction
      await prisma.transaction.create({
        data: {
          userId, // ✅ now guaranteed to be a string
          paymentId: session.id,
          amount,
          type,
          method: 'Stripe',
          currency,
        },
      });

      return res.status(200).json({ received: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(200).json({ received: true });
};
