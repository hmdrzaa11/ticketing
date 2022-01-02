import mongoose from "mongoose";
import { OrderCancelledEvent } from "@hrotickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Message } from "node-nats-streaming";

let setup = async () => {
  let listener = new OrderCancelledListener(natsWrapper.client);
  let orderId = new mongoose.Types.ObjectId().toHexString();
  let ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "asdf",
  });
  ticket.set({
    orderId,
  });

  await ticket.save();

  let data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { msg, listener, ticket, orderId, data };
};

it("updates the ticket and publishes an even and ack the message", async () => {
  let { msg, data, ticket, orderId, listener } = await setup();
  await listener.onMessage(data, msg);
  let updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
