import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

it("returns a 404 if ticket not found", async () => {
  let id = new mongoose.Types.ObjectId().toHexString();
  let response = await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it("returns the ticket if ticket is found", async () => {
  let title = "concert";
  let price = 20;
  let res = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title,
      price,
    })
    .expect(201);

  let ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
