import request from "supertest";
import { app } from "../../app";

it("should return a 201 in successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);
});

it("should return a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "asdf.com", password: "asdf" })
    .expect(400);
});

it("should return a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "a" })
    .expect(400);
});

it("should return a 400 with missing email and pass", async () => {
  return request(app).post("/api/users/signup").send({}).expect(400);
});

it("should disallow duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(400);
});

it("should set a cookie after successful signup", async () => {
  let res = await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  expect(res.get("Set-Cookie")).toBeDefined();
});
