import { Request, Response } from "express";
import { ResponseUtil } from "../../utils/response.utils";
import { CustomException } from "../../exception/custom.exception";
import { plainToInstance } from "class-transformer";
import { TicketService } from "./tickets.services";
import {
  CreateTicketDto,
  GetTicketByIdAndDate,
  UpdateTicketDto,
} from "./tickets.dto";

export class TicketController {
  private ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  async create(req: Request, res: Response) {
    try {
      const dto = plainToInstance(CreateTicketDto, req.body, {
        enableImplicitConversion: true,
      });

      const station = await this.ticketService.createTicket(dto);
      const response = ResponseUtil.success(
        station,
        "Ticket booked successfully"
      );
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async getTickets(req: Request, res: Response) {
    try {
      // const dto = plainToInstance(CreateTicketDto, req.body, {
      //   enableImplicitConversion: true,
      // });

      // const station = await this.ticketService.createTicket(dto);
      const dto = plainToInstance(GetTicketByIdAndDate, req.body, {
        enableImplicitConversion: true,
      });
      const ticket = await this.ticketService.getTicketByIdAndDate(dto);
      const response = ResponseUtil.success(ticket, "Tickets get successfully");
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async getTicketsByUserId(req: Request, res: Response) {
    try {
      // const dto = plainToInstance(CreateTicketDto, req.body, {
      //   enableImplicitConversion: true,
      // });

      // const station = await this.ticketService.createTicket(dto);
      // const dto = plainToInstance(GetTicketByIdAndDate, req.params, {
      //   enableImplicitConversion: true,
      // });
      const { user_id } = req.params;
      const ticket = await this.ticketService.getTicketsFromUserId(user_id);
      const response = ResponseUtil.success(ticket, "Tickets get successfully");
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async deleteTicket(req: Request, res: Response) {
    try {
      const { ticket_id } = req.params;
      const ticket = await this.ticketService.deleteTicket(ticket_id);
      const response = ResponseUtil.success(
        ticket,
        "Tickets delete successfully"
      );
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async updateTicket(req: Request, res: Response) {
    try {
      const { ticket_id } = req.params;
      const dto = plainToInstance(UpdateTicketDto, req.body, {
        enableImplicitConversion: true,
      });
      const ticket = await this.ticketService.updateTicket(ticket_id, dto);
      const response = ResponseUtil.success(
        ticket,
        "Tickets delete successfully"
      );
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }
}
