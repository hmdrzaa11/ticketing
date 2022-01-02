import express, { Request, Response } from "express";
import { NotFoundError } from "@hrotickets/common";
import { Ticket } from "../models/ticket";

let router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  let ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new NotFoundError();
  res.send(ticket);
});

export { router as showTicketRouter };
