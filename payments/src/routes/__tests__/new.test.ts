import request from "supertest";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { app } from "../../app";
import { OrderStatus } from "@hrotickets/common";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns a 404 when order dose not exists", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: "asdf",
    })
    .expect(404);
});

it("returns a 401 when order dose not belong to the user", async () => {
  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      orderId: order.id,
      token: "asdf",
    })
    .expect(401);
});

it("returns a 400 when order is already cancelled", async () => {
  let userId = new mongoose.Types.ObjectId().toHexString();
  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      orderId: order.id,
      token: "asdf",
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  let userId = new mongoose.Types.ObjectId().toHexString();
  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  expect(stripe.charges.create).toHaveBeenCalled();
  let chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(20 * 100);
  expect(chargeOptions.currency).toEqual("usd");
});
