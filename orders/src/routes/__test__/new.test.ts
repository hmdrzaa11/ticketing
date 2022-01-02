import request from "supertest";
import { OrderStatus } from "@hrotickets/common";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the ticket dose not exist", async () => {
  let ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it("returns an error if the ticket already reserved", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 123,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  let order = Order.build({
    ticket,
    userId: "lalsllslslslslls",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("it reserves a ticket", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 30,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order created event", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 30,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
