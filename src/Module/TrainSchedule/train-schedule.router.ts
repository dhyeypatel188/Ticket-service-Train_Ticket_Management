import { Router } from "express";
import { TrainScheduleController } from "./train-schedule.controller";
import { adminOnly } from "../../middleware/admin.middleware";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
// import {
//   CreateTrainScheduleDto,
//   UpdateTrainScheduleDto,
// } from "./train-schedule.dto";

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
const trainScheduleController = new TrainScheduleController();

// // Create a new train schedule
// router.post(
//   "/schedule",
//   validateDto(CreateTrainScheduleDto),
//   trainScheduleController.create.bind(trainScheduleController)
// );

// // Get train schedule by ID
// router.get(
//   "/schedule/:id",
//   adminOnly,
//   trainScheduleController.findById.bind(trainScheduleController)
// );

// router.post(
//   "/schedule/list",
//   adminOnly,
//   trainScheduleController.getAllSchedule.bind(trainScheduleController)
// );

// // Update train schedule
// router.put(
//   "/schedule/:id",
//   validateDto(UpdateTrainScheduleDto),
//   trainScheduleController.update.bind(trainScheduleController)
// );

// // Delete train schedule
// router.delete(
//   "/schedule/:id",
//   trainScheduleController.delete.bind(trainScheduleController)
// );

// // Get schedules by train ID
// router.get(
//   "/schedule/train/:trainId",
//   trainScheduleController.findByTrainId.bind(trainScheduleController)
// );

// // Get schedules by station ID
// router.get(
//   "/schedule/station/:stationId",
//   trainScheduleController.findByStationId.bind(trainScheduleController)
// );

router.post(
  "/findTrain",
  trainScheduleController.findTrainSchedules.bind(trainScheduleController)
)

export default router;
