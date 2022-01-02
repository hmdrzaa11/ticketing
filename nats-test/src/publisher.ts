import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";
console.clear();

let client = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

client.on("connect", async () => {
  console.log("Publisher connected to NATS");
  let publisher = new TicketCreatedPublisher(client);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 12,
    });
  } catch (error) {
    console.error(error);
  }
});
