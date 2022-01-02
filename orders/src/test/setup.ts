import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

jest.mock("../nats-wrapper.ts");

declare global {
  var signin: () => string;
}

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  mongo = await MongoMemoryServer.create();
  let mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  //delete and reset all data
  jest.clearAllMocks();
  let collections = await mongoose.connection.db.collections();
  for (let coll of collections) {
    await coll.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  let id = new mongoose.Types.ObjectId().toHexString();
  //Build a JWT payload {id,email}
  let payload = { id, email: "asdf@asdf.com" };
  //Create the JWT
  let token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build Session obj {jwt:my_jwt}
  let session = { jwt: token };
  //Turn that session into json
  let sessionJson = JSON.stringify(session);
  //Take it and encode it as base64
  let base64 = Buffer.from(sessionJson).toString("base64");
  //return a string with the exact format from browser
  return `session=${base64}`; //we do this because only because "supertest" consider cookies as []string
};
