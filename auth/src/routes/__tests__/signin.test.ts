import request from "supertest";
import { app } from "../../app";

it("should fail when an email dose not exists", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(400);
});

it("should fail when an incorrect password provided", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "asdf@asdf.com", password: "fdsa" })
    .expect(400);
});

it("should response with a cookie when given valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  let res = await request(app)
    .post("/api/users/signin")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(200);

  expect(res.get("Set-Cookie")).toBeDefined();
});
