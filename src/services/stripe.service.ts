import Stripe from 'stripe';
import { env } from '../config/env.js';

let stripe: Stripe | null = null;

export const getStripe = (): Stripe | null => {
  if (!stripe && env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

export const createCheckoutSession = async (
  orderId: string,
  courseTitle: string,
  amount: number,
  courseId: string
): Promise<{ sessionId: string; url: string } | null> => {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    return null;
  }

  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: courseTitle,
            description: `Purchase: ${courseTitle}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/checkout/cancel`,
    metadata: {
      orderId,
      courseId,
    },
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
};

export const retrieveCheckoutSession = async (
  sessionId: string
): Promise<Stripe.Checkout.Session | null> => {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    return null;
  }

  return await stripeInstance.checkout.sessions.retrieve(sessionId);
};
