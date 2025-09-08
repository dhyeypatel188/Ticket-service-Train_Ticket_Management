import { Request, Response } from "express";
import { TrainScheduleService } from "./train-schedule.services";
import {
  CreateTrainScheduleDto,
  FindTrainsBetweenStationsDto,
  UpdateTrainScheduleDto,
} from "./train-schedule.dto";
import { CustomException } from "../../exception/custom.exception";
import { ResponseUtil } from "../../utils/response.utils";

export class TrainScheduleController {
  private trainScheduleService: TrainScheduleService;

  constructor() {
    this.trainScheduleService = new TrainScheduleService();
  }

  // async create(req: Request, res: Response) {
  //   try {
  //     const createDto: CreateTrainScheduleDto = req.body;
  //     const schedule = await this.trainScheduleService.create(createDto);
  //     const response = ResponseUtil.success(
  //       schedule,
  //       "Train schedule created successfully"
  //     );
  //     res.status(201).json(response);
  //   } catch (error) {
  //     if (error instanceof CustomException) {
  //       res
  //         .status(error.response.responseStatusList.statusList[0].statusCode)
  //         .json(error.response);
  //     } else {
  //       console.log(error);
  //       const customError = new CustomException(
  //         400,
  //         "Validation failed",
  //         error
  //       );
  //       res.status(400).json(customError.response);
  //     }
  //   }
  // }

  async findById(req: Request, res: Response) {
    try {
      const schedule = await this.trainScheduleService.findById(
        parseInt(req.params.id)
      );

      const response = ResponseUtil.success(
        schedule,
        "Train schedule found successfully"
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

  // async update(req: Request, res: Response) {
  //   try {
  //     const updateDto: UpdateTrainScheduleDto = req.body;
  //     const schedule = await this.trainScheduleService.update(
  //       parseInt(req.params.id),
  //       updateDto
  //     );
  //     const response = ResponseUtil.success(
  //       schedule,
  //       "Train schedule updated successfully"
  //     );
  //     res.status(200).json(response);
  //   } catch (error) {
  //     if (error instanceof CustomException) {
  //       res
  //         .status(error.response.responseStatusList.statusList[0].statusCode)
  //         .json(error.response);
  //     } else {
  //       console.log(error);
  //       const customError = new CustomException(
  //         400,
  //         "Validation failed",
  //         error
  //       );
  //       res.status(400).json(customError.response);
  //     }
  //   }
  // }

  // async delete(req: Request, res: Response) {
  //   try {
  //     const deleted = await this.trainScheduleService.delete(
  //       parseInt(req.params.id)
  //     );
  //     const response = ResponseUtil.success(
  //       {},
  //       "Train schedules deleted successfully"
  //     );
  //     res.status(200).send(response);
  //   } catch (error) {
  //     if (error instanceof CustomException) {
  //       res
  //         .status(error.response.responseStatusList.statusList[0].statusCode)
  //         .json(error.response);
  //     } else {
  //       console.log(error);
  //       const customError = new CustomException(
  //         400,
  //         "Validation failed",
  //         error
  //       );
  //       res.status(400).json(customError.response);
  //     }
  //   }
  // }

  async findByTrainId(req: Request, res: Response) {
    try {
      const schedules = await this.trainScheduleService.findByTrainId(
        req.params.trainId
      );
      const response = ResponseUtil.success(
        schedules,
        "Train schedules found successfully"
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

  async findByStationId(req: Request, res: Response) {
    try {
      const schedules = await this.trainScheduleService.findByStationId(
        req.params.stationId
      );
      const response = ResponseUtil.success(
        schedules,
        "Train schedules found successfully"
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

  async getAllSchedule(req: Request, res: Response) {
    try {
      // Get parameters from query string with defaults
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search ? (req.query.search as string) : "";

      const station = await this.trainScheduleService.getAllTrain(
        page,
        limit,
        search
      );
      const response = ResponseUtil.success(
        station.result,
        "Trains get successfully",
        station.pagination
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

    async findTrainSchedules(req: Request, res: Response) {
    try {
      // Get parameters from query string with defaults
      const page = req.body.page ? parseInt(req.body.page as string) : 1;
      const limit = req.body.limit ? parseInt(req.body.limit as string) : 10;
      const search = req.body.search ? (req.body.search as string) : "";
      const findDto: FindTrainsBetweenStationsDto = req.body;

      const station = await this.trainScheduleService.findTrainsBetweenStations(
    findDto
      );
      const response = ResponseUtil.success(
        station.trains,
        "Trains get successfully",
        station.pagination
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
