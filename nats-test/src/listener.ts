import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TickedCreatedListener } from "./events/ticket-created-listener";

console.clear();

let stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    //when client successfully closes down this is going to run
    //and we exit from program
    console.log("NATS connection closes");
    process.exit();
  });

  new TickedCreatedListener(stan).listen();
});

process.on("SIGINT", () => stan.close()); //watching for "interrupt" signal for example "CTRL + C" and when we got them we close our
//client first
process.on("SIGTERM", () => stan.close()); // watching for "terminate" signal
