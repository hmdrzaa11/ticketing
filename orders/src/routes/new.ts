import express, { Request, Response } from "express";
import mongoose from "mongoose";
import {
  NotFoundError,
  requiredAuth,
  OrderStatus,
  validateRequest,
  BadRequestError,
} from "@hrotickets/common";
import { body } from "express-validator";

import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

let router = express.Router();

// const EXPIRATION_WINDOW_SECONDS = 15 * 60;
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requiredAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //find the ticket the user trying to order
    let { ticketId } = req.body;
    let ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    //make sure the ticket is  not already reserved (means we need to look a orders model and make sure this ticket is not there or
    // if its there its status must be 'cancelled')
    let isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    //calculate the expiration date
    let expirationData = new Date();
    expirationData.setSeconds(
      expirationData.getSeconds() + EXPIRATION_WINDOW_SECONDS
    );
    //build the order and save it

    let order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expirationData,
      ticket,
    });

    await order.save();

    //publish an event and say all other services that order was created

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      version: order.version,
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
