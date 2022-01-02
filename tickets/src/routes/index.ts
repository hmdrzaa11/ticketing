import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";

let router = express.Router();

router.get("/api/tickets", async (req, res) => {
  let tickets = await Ticket.find({
    orderId: undefined,
  });
  res.send(tickets);
});

export { router as indexTicketRouter };
