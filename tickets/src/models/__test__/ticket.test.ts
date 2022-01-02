import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  //create a ticket
  let ticket = Ticket.build({
    title: "concert",
    price: 1,
    userId: "22",
  });
  //save it
  await ticket.save();
  //fetch it 2 times
  let firstTime = await Ticket.findById(ticket.id);
  let secondTime = await Ticket.findById(ticket.id);
  //make changes to that ticket in 2 time
  firstTime!.set({ price: 10 });
  secondTime!.set({ price: 15 });
  // save the first fetched ticket
  await firstTime!.save();
  //save the second one but this will error because when we save the first one its going to add to version then we save again
  //that library is going to error because our version is 1 behind of the current version
  try {
    await secondTime!.save();
  } catch (error) {
    return;
  }
});

it("inc the version number on multiple save", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "asdf",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  //let save another time
  await ticket.save();
  expect(ticket.version).toEqual(1);
});
