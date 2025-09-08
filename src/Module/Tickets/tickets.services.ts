import { CustomException } from "../../exception/custom.exception";
import { TicketRepository } from "./tickets.repository";
import {
  CreateTicketDto,
  GetTicketByIdAndDate,
  UpdateTicketDto,
} from "./tickets.dto";
import { TrainRepository } from "../Train/train.repository";
import { StationRepository } from "../Station/station.repository";
import { TrainScheduleController } from "../TrainSchedule/train-schedule.controller";
import { TrainScheduleRepository } from "../TrainSchedule/train-schedule.repository";
// import {UserService} from "../"
const SALT_ROUNDS = 10;

export class TicketService {
  private ticketRepository: TicketRepository;
  private trainRepository: TrainRepository;
  private stationRepository: StationRepository;
  private scheduleRepository: TrainScheduleRepository;
  constructor() {
    this.ticketRepository = new TicketRepository();
    this.trainRepository = new TrainRepository();
    this.stationRepository = new StationRepository();
  }

  async createTicket(dto: CreateTicketDto) {
    await this.ticketRepository.createTable();
    // const user = await this.ticketRepository.findStationByStationName(
    //   dto.user_id
    // );
    // if (user) {
    //   throw new CustomException(400, "User not found");
    // }
    const train = await this.trainRepository.findTrainById(dto.train_id);
    if (!train) {
      throw new CustomException(400, "Train not found");
    }

    const departure_station = await this.stationRepository.findStationById(
      dto.departure_station_id
    );
    if (!departure_station) {
      throw new CustomException(400, "Departure station not found");
    }

    const destination_station = await this.stationRepository.findStationById(
      dto.destination_station_id
    );
    if (!destination_station) {
      throw new CustomException(400, "Destination station not found");
    }
    console.log(JSON.stringify(dto), "aosjdoiasjdi");
    const Ticket = await this.ticketRepository.createTicket(dto);
    return Ticket;
  }

  async getTicketByIdAndDate(data: GetTicketByIdAndDate) {
    await this.ticketRepository.createTable();

    const train = await this.trainRepository.findTrainById(data.train_id);
    if (!train) {
      throw new CustomException(400, "Train not found");
    }

    const schedule = await this.ticketRepository.getBookedSeatsByTrainIdAndDate(
      data
    );

    return schedule;
  }

  async getTicketsFromUserId(user_id: string) {
    const result = await this.ticketRepository.getTicketsByUserId(user_id);
    return result;
  }

  async deleteTicket(ticket_id: string) {
    const ticket = await this.ticketRepository.getTicketById(ticket_id);
    if (!ticket) {
      throw new CustomException(400, "Ticket not found");
    }
    const result = await this.ticketRepository.deleteTicket(ticket_id);
    return result;
  }

  async updateTicket(ticket_id: string, data: UpdateTicketDto) {
    const ticket = await this.ticketRepository.getTicketById(ticket_id);
    if (!ticket) {
      throw new CustomException(400, "Ticket not found");
    }
    const result = await this.ticketRepository.updateTickets(ticket_id, data);
    return result;
  }
}
