import { OrderCreatedEvent, OrderStatus } from "@hrotickets/common";
import mongoose from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

let setup = async () => {
  //create an instance of listener
  let listener = new OrderCreatedListener(natsWrapper.client);

  //create and save a ticket
  let ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: "aaa",
  });

  await ticket.save();

  //create the fake data
  let data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "asdf",
    expiresAt: "asdfd",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, listener };
};

it("sets the userId of ticket ", async () => {
  let { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  let updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message ", async () => {
  let { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  let { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  let updatedTicket = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(updatedTicket.orderId);
});
