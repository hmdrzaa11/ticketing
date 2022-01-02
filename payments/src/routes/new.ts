import express, { Request, Response } from "express";
import { body } from "express-validator";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";

import {
  requiredAuth,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
  BadRequestError,
} from "@hrotickets/common";

import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

let router = express.Router();

router.post(
  "/api/payments",
  requiredAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    let { token, orderId } = req.body;
    let order = await Order.findById(orderId);
    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("Order already cancelled");

    let charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    //create a payment record
    let payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    //publish an event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      stripeId: charge.id,
      orderId: payment.orderId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
