import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@hrotickets/common";

import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

let setup = async () => {
  // create a listener
  let listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  let ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  // create a fake data
  let data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new concert",
    price: 99,
    userId: "sssssss",
  };
  // create a fake msg
  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, msg, data };
};

it("finds , updates and saves a ticket", async () => {
  let { listener, data, ticket, msg } = await setup();
  await listener.onMessage(data, msg);
  let updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(1);
});

it("acks the message", async () => {
  let { msg, listener, data } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("dose not call ack if event has a skipped version", async () => {
  let { msg, listener, data, ticket } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {
    expect(msg.ack).not.toHaveBeenCalled();
    return;
  }
});
