import express, { Request, Response } from "express";
import {
  NotFoundError,
  requiredAuth,
  NotAuthorizedError,
} from "@hrotickets/common";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

let router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requiredAuth,
  async (req: Request, res: Response) => {
    let orderId = req.params.orderId;
    let order = await Order.findById(orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
