import mongoose from "mongoose";
import { OrderStatus, ExpirationCompleteEvent } from "@hrotickets/common";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";

let setup = async () => {
  let listener = new ExpirationCompleteListener(natsWrapper.client);
  let ticket = Ticket.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  let order = Order.build({
    status: OrderStatus.Created,
    userId: "asdf",
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  let data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //@ts-ignore
  let message: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, message };
};

it("updates order status to cancelled", async () => {
  let { listener, message, order, data, ticket } = await setup();
  await listener.onMessage(data, message);
  let updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("emits an OrderedCancelled event", async () => {
  let { listener, message, order, data, ticket } = await setup();
  await listener.onMessage(data, message);
  let eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});
it("ack the message ", async () => {
  let { listener, message, order, data, ticket } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});
