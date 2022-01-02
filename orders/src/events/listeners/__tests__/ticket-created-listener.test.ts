import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from "@hrotickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
let setup = async () => {
  //create an instance of a listener
  let listener = new TicketCreatedListener(natsWrapper.client);
  //create a fake data event
  let data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };
  //create a fake message object
  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  let { listener, data, msg } = await setup();
  //call the onMessage function with data object and message object
  await listener.onMessage(data, msg);
  //write assertion to make sure ticket was created
  let ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
});

it("acks the message", async () => {
  let { data, listener, msg } = await setup();
  //call the onMessage function with data object and message object
  await listener.onMessage(data, msg);
  // write assertion to make sure ack function is called

  expect(msg.ack).toHaveBeenCalled();
});
