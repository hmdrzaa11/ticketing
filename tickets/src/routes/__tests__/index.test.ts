import request from "supertest";
import { app } from "../../app";

let createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "asdf",
    price: 10,
  });
};

it("can fetch a list of tickets", async () => {
  await createTicket();
  await createTicket();
  let response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(2);
});
