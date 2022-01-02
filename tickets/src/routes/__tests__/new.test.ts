import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for POST", async () => {
  let response = await request(app).post("/api/tickets").send({});
  expect(response.statusCode).not.toEqual(404);
});

it("can be only accessed if user is signed in", async () => {
  let response = await request(app).post("/api/tickets").send({});
  expect(response.statusCode).toEqual(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  let cookie = global.signin();
  let response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "", price: 10 })
    .expect(400);
});
it("returns an error if invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "asdff", price: -10 })
    .expect(400);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "asdf" })
    .expect(400);
});
it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "asdf",
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
});

it("publishes an event", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "asdf",
      price: 20,
    })
    .expect(201);

  //now we need to make sure that fn is called after creatinghe event
  // console.log(natsWrapper); // if you log it you will see that its the mock versionwith alot of methods mocks
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
