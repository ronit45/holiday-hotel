import Stripe from "stripe";
import { config } from "../config/env";

class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey);
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects the amount in the smallest currency unit (e.g., pence)
      currency,
      metadata,
    });
    return paymentIntent;
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async refundPayment(paymentIntentId: string): Promise<number | undefined> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund.amount ? refund.amount / 100 : undefined;
  }
}

export const paymentService = new PaymentService();
