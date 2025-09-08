import { NextFunction, Request, Response, Router } from "express";
import { adminOnly } from "../../middleware/admin.middleware";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { TicketController } from "./tickets.controller";
import { CreateTicketDto, GetTicketByIdAndDate } from "./tickets.dto";

function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body, {
      enableImplicitConversion: true,
    });
    const errors = await validate(dto);
    if (errors.length) {
      res.status(400).json({
        message: "Validation failed",
        details: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }
    req.body = dto; // forward the validated & transformed object
    next();
  };
}

const router = Router();
const ticketController = new TicketController();

// Admin-only routes
router.post(
  "/ticket",
  validateDto(CreateTicketDto),
  ticketController.create.bind(ticketController)
);

router.post(
  "/ticket/get",
  validateDto(GetTicketByIdAndDate),
  ticketController.getTickets.bind(ticketController)
);

router.get(
  "/ticket/:user_id",
  ticketController.getTicketsByUserId.bind(ticketController)
);

router.delete(
  "/ticket/:ticket_id",
  ticketController.deleteTicket.bind(ticketController)
);

router.patch(
  "/ticket/:ticket_id",
  ticketController.updateTicket.bind(ticketController)
);
export default router;
