import request from "supertest";
import { app } from "../../app";

it("should response with details about the current user", async () => {
  let cookies = await global.signin();
  let res = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookies)
    .send()
    .expect(200);

  expect(res.body.currentUser.email).toEqual("asdf@asdf.com");
});

it("should response with null if not authenticated", async () => {
  let res = await request(app).get("/api/users/currentuser").send().expect(200);

  expect(res.body.currentUser).toBe(null);
});
