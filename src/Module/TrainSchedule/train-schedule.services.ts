import { TrainScheduleRepository } from "./train-schedule.repository";
import {
  CreateTrainScheduleDto,
  FindTrainsBetweenStationsDto,
  UpdateTrainScheduleDto,
} from "./train-schedule.dto";
import { CustomException } from "../../exception/custom.exception";
import { stat } from "fs";
import { StationRepository } from "../Station/station.repository";
import { TrainRepository } from "../Train/train.repository";

export class TrainScheduleService {
  private trainScheduleRepository: TrainScheduleRepository;
  private stationRepository: StationRepository;
  private trainRepository: TrainRepository;

  constructor() {
    this.trainScheduleRepository = new TrainScheduleRepository();
    this.stationRepository = new StationRepository();
    this.trainRepository = new TrainRepository();
  }

  // async create(data: CreateTrainScheduleDto) {
  //   await this.trainScheduleRepository.createTable();
  //   const trainStation =
  //     await this.trainScheduleRepository.findByTrainandStation(
  //       data.trainId,
  //       data.stationId
  //     );
  //   if (trainStation.length > 0) {
  //     throw new CustomException(
  //       404,
  //       "This train is already schedule with this station"
  //     );
  //   }

  //   if (data.arrivalTime === null && !data.isStart) {
  //     throw new CustomException(
  //       404,
  //       "ArrivalTime is null then isStart should true"
  //     );
  //   }

  //   if (data.departureTime === null && !data.isEnd) {
  //     throw new CustomException(
  //       404,
  //       "DepartureTime is null then isEnd should true"
  //     );
  //   }

  //   return await this.trainScheduleRepository.create(data);
  // }

  async findById(id: number) {
    const schedule = await this.trainScheduleRepository.findById(id);
    if (!schedule) {
      throw new CustomException(404, "Train schedule not found");
    }
    return schedule;
  }

  // async update(id: number, data: UpdateTrainScheduleDto) {
  //   const updated = await this.trainScheduleRepository.update(id, data);
  //   if (!updated) {
  //     throw new CustomException(404, "Train schedule not found");
  //   }
  //   return updated;
  // }

  // async delete(id: number) {
  //   const deleted = await this.trainScheduleRepository.delete(id);
  //   if (!deleted) {
  //     throw new CustomException(404, "Train schedule not found");
  //   }
  //   return deleted;
  // }

  async findByTrainId(trainId: string) {
    const schedules = await this.trainScheduleRepository.findByTrainId(trainId);
    if (!schedules) {
      throw new CustomException(404, "Train schedules not found");
    }
    return schedules;
  }

  async findByStationId(stationId: string) {
    const schedules = await this.trainScheduleRepository.findByStationId(
      stationId
    );
    if (!schedules) {
      throw new CustomException(404, "Train schedules not found");
    }
    return schedules;
  }

  async findByTrainStationId(train_id: string, station_id: string) {
    const result = await this.trainScheduleRepository.findByTrainandStation(
      train_id,
      station_id
    );
    return result;
  }

  async getAllTrain(page: number, limit: number, search: string) {
    await this.trainScheduleRepository.createTable();
    const result = await this.trainScheduleRepository.getSchedule(
      page,
      limit,
      search
    );
    return {
      result: result.data,
      pagination: {
        currentPage: page,
        limit: limit,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
      },
    };
  }

  async findTrainsBetweenStations(
    findDto: FindTrainsBetweenStationsDto
  ): Promise<any> {
    // Validate stations exist
    await this.validateStationsExist(
      findDto.departure_station_id,
      findDto.arrival_station_id
    );

    // Parse and validate travel date
    const { travelDate, dayOfWeek } = this.parseTravelDate(findDto.travelDate);

    // Calculate pagination
    const { limit, offset } = this.calculatePagination(
      findDto.page,
      findDto.limit
    );

    // Get raw data from repository
    const [trains, total] = await Promise.all([
      this.trainScheduleRepository.findTrainsByDayAndStations(
        findDto.departure_station_id,
        findDto.arrival_station_id,
        dayOfWeek,
        limit,
        offset
      ),
      this.trainScheduleRepository.countTrainsByDayAndStations(
        findDto.departure_station_id,
        findDto.arrival_station_id,
        dayOfWeek
      ),
    ]);

    // Process results with actual dates
    const processedTrains = await this.processTrainResults(
      trains.rows,
      travelDate,
      dayOfWeek,
      findDto
    );

    return {
      trains: processedTrains,
      pagination: this.buildPaginationResult(total, findDto.page, limit),
    };
  }

  private async validateStationsExist(departureId: string, arrivalId: string) {
    const [departureExists, arrivalExists] = await Promise.all([
      this.stationRepository.findStationById(departureId),
      this.stationRepository.findStationById(arrivalId),
    ]);

    if (!departureExists || !arrivalExists) {
      throw new CustomException(404, "Station not found");
    }
  }

  private parseTravelDate(travelDate: string): {
    travelDate: Date;
    dayOfWeek: number;
  } {
    const date = new Date(travelDate);
    if (isNaN(date.getTime())) {
      throw new CustomException(404, "Invalid travel date format");
    }

    return {
      travelDate: date,
      dayOfWeek: date.getDay(), // 0 (Sunday) to 6 (Saturday)
    };
  }

  private calculatePagination(page = 1, limit = 10) {
    page = Math.max(1, parseInt(page.toString(), 10));
    limit = Math.max(1, Math.min(100, parseInt(limit.toString(), 10)));

    return {
      limit,
      offset: (page - 1) * limit,
    };
  }

  private async processTrainResults(
    trains: any[],
    travelDate: Date,
    dayOfWeek: number,
    findDto: FindTrainsBetweenStationsDto
  ) {
    return Promise.all(
      trains.map(async (train) => {
        const departureDate = new Date(travelDate);
        departureDate.setDate(
          departureDate.getDate() + (train.departure_day_offset - dayOfWeek)
        );

        const arrivalDate = new Date(departureDate);
        arrivalDate.setDate(
          arrivalDate.getDate() +
            (train.arrival_day_offset - train.departure_day_offset)
        );

        const [departureStation, arrivalStation] = await Promise.all([
          this.stationRepository.findStationById(findDto.departure_station_id),
          this.stationRepository.findStationById(findDto.arrival_station_id),
        ]);

        return {
          train_id: train.train_id,
          train_name: train.train_name,
          departure_station_id: findDto.departure_station_id,
          departure_station_name: departureStation.station_name,
          arrival_station_name: arrivalStation.station_name,
          arrival_station_id: findDto.arrival_station_id,
          departure_time: train.departure_time,
          departure_date: departureDate.toISOString().split("T")[0],
          arrival_time: train.arrival_time,
          arrival_date: arrivalDate.toISOString().split("T")[0],
          travel_duration: train.travel_duration,
        };
      })
    );
  }

  private buildPaginationResult(total: number, page: number, limit: number) {
    return {
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }
}
