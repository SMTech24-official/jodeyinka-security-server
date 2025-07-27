import Stripe from 'stripe';
import prisma from '../../utils/prisma';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SK_KEY as string);

export const stripeWebhookHandler = async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.webhook_secret as string
    );
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const type: any = session.metadata?.type;

        if (!userId || !type || !session.subscription) {
          return res.status(400).json({ error: 'Missing metadata or subscription' });
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const amount = subscription.items.data[0].price.unit_amount! / 100;
        const currency = subscription.items.data[0].price.currency;
     const nextBilling = new Date();
            nextBilling.setDate(nextBilling.getDate() + 30);

        await prisma.transaction.create({
          data: {
            userId,
            paymentId: subscription.id, // subscription id দিবে
            amount,
            type,
            method: 'Stripe',
            currency,
            status: 'ACTIVE',
            nextBilling: nextBilling,  // এখানে আপডেট করলাম
          },
        });

        return res.status(200).json({ received: true });
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.transaction.updateMany({
          where: {
            paymentId: subscription.id,
          },
          data: {
            status: 'CANCELLED',
            nextBilling: null,  // ক্যানসেল হলে nextBilling ফাঁকা করবে
            updatedAt: new Date(),
            
          },
        });

        return res.status(200).json({ received: true });
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };

        if (!invoice.subscription) {
          return res.status(400).json({ error: 'Subscription ID missing in invoice' });
        }

        await prisma.transaction.updateMany({
          where: {
            paymentId: invoice.subscription,
          },
          data: {
            status: 'PAST_DUE',
            updatedAt: new Date(),
            nextBilling:null
          },
        });

        return res.status(200).json({ received: true });
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };

        if (!invoice.subscription) {
          return res.status(400).json({ error: 'Subscription ID missing in invoice' });
        }

       

      const nextBilling = new Date();
            nextBilling.setDate(nextBilling.getDate() + 30);


        await prisma.transaction.updateMany({
          where: {
            paymentId: invoice.subscription,
          },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date(),
            nextBilling: nextBilling,  // nextBilling আপডেট করলাম
          },
        });

        return res.status(200).json({ received: true });
      }

      default:
        return res.status(200).json({ received: true });
    }
  } catch (error: any) {
    console.error('Webhook handling failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
