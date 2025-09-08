import { stat } from "fs";
import { query } from "../../config/database";
import {
  CreateTrainScheduleDto,
  FindTrainsBetweenStationsDto,
  UpdateTrainScheduleDto,
} from "./train-schedule.dto";
import { CustomException } from "../../exception/custom.exception";

export class TrainScheduleRepository {
  private tableName = "train_schedule";

  async createTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          train_id UUID NOT NULL REFERENCES "Trains"(train_id),x
          station_id UUID NOT NULL REFERENCES "Stations"(station_id),
          stop_number INTEGER NOT NULL,
          arrival_time TIME NOT NULL,
          departure_time TIME NOT NULL,
          day_offset INTEGER NOT NULL DEFAULT 0,
          is_start BOOLEAN NOT NULL DEFAULT false,
          is_end BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log(`Table ${this.tableName} created or already exists`);
    } catch (error) {
      console.error(`Error creating table ${this.tableName}:`, error);
    }
  }

  // async create(data: CreateTrainScheduleDto) {
  //   const result = await query(
  //     `INSERT INTO ${this.tableName} 
  //       (train_id, station_id, stop_number, arrival_time, departure_time, day_offset, is_start, is_end)
  //       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  //       RETURNING *`,
  //     [
  //       data.trainId,
  //       data.stationId,
  //       data.stopNumber,
  //       data.arrivalTime,
  //       data.departureTime,
  //       data.dayOffset,
  //       data.isStart,
  //       data.isEnd,
  //     ]
  //   );
  //   return result.rows[0];
  // }

  async findById(id: number) {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE schedule_id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // async update(id: number, data: UpdateTrainScheduleDto) {
  //   const fields = [];
  //   const values = [];
  //   let index = 1;

  //   if (data.trainId !== undefined) {
  //     fields.push(`train_id = $${index++}`);
  //     values.push(data.trainId);
  //   }

  //   if (data.stationId !== undefined) {
  //     fields.push(`station_id = $${index++}`);
  //     values.push(data.stationId);
  //   }

  //   if (data.stopNumber !== undefined) {
  //     fields.push(`stop_number = $${index++}`);
  //     values.push(data.stopNumber);
  //   }

  //   if (data.arrivalTime !== undefined) {
  //     fields.push(`arrival_time = $${index++}`);
  //     values.push(data.arrivalTime);
  //   }

  //   if (data.departureTime !== undefined) {
  //     fields.push(`departure_time = $${index++}`);
  //     values.push(data.departureTime);
  //   }

  //   if (data.dayOffset !== undefined) {
  //     fields.push(`day_offset = $${index++}`);
  //     values.push(data.dayOffset);
  //   }

  //   if (data.isStart !== undefined) {
  //     fields.push(`is_start = $${index++}`);
  //     values.push(data.isStart);
  //   }

  //   if (data.isEnd !== undefined) {
  //     fields.push(`is_end = $${index++}`);
  //     values.push(data.isEnd);
  //   }

  //   if (fields.length === 0) {
  //     throw new Error("No fields to update");
  //   }

  //   fields.push(`updated_at = CURRENT_TIMESTAMP`);
  //   values.push(id);

  //   const queryText = `
  //     UPDATE ${this.tableName}
  //     SET ${fields.join(", ")}
  //     WHERE schedule_id = $${index}
  //     RETURNING *;
  //   `;

  //   const result = await query(queryText, values);
  //   return result.rows[0];
  // }

  // async delete(id: number) {
  //   const result = await query(
  //     `DELETE FROM ${this.tableName} WHERE schedule_id = $1 RETURNING *`,
  //     [id]
  //   );
  //   return result.rows[0];
  // }

  async findByTrainId(trainId: string) {
    const result = await query(
      `SELECT * FROM ${this.tableName} 
       WHERE train_id = $1
       ORDER BY stop_number ASC`,
      [trainId]
    );
    return result.rows;
  }

  async findByTrainandStation(train_id: string, station_id: string) {
    const result = await query(
      `SELECT * FROM ${this.tableName}
    WHERE train_id = $1
    AND station_id = $2`,
      [train_id, station_id]
    );
    return result.rows;
  }

  async getSchedule(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit;
    const searchQuery = `%${search.toLowerCase()}%`;
    const result = await query(
      `SELECT * FROM ${this.tableName}  
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const total = result.rows.length;

    return { data: result.rows, total, page, limit };
  }

  async findByStationId(stationId: string) {
    const result = await query(
      `SELECT * FROM ${this.tableName} 
       WHERE station_id = $1
       ORDER BY departure_time ASC`,
      [stationId]
    );
    return result.rows;
  }

 async findTrainsByDayAndStations(
    departureStationId: string,
    arrivalStationId: string,
    dayOfWeek: number,
    limit: number,
    offset: number
  ): Promise<any> {
    return query(`
      SELECT 
        ts1.train_id,
        t.train_name,
        ts1.departure_time,
        ts2.arrival_time,
        (ts2.arrival_time - ts1.departure_time) as travel_duration,
        ts1.day_offset as departure_day_offset,
        ts2.day_offset as arrival_day_offset
      FROM train_schedule ts1
      JOIN train_schedule ts2 ON ts1.train_id = ts2.train_id
      JOIN trains t ON ts1.train_id = t.train_id
      WHERE ts1.station_id = $1
        AND ts2.station_id = $2
        AND ts1.day_offset % 7 = $3
        AND ts2.day_offset % 7 = $3
        AND ts1.stop_number < ts2.stop_number
      ORDER BY ts1.departure_time ASC
      LIMIT $4 OFFSET $5
    `, [departureStationId, arrivalStationId, dayOfWeek, limit, offset]);
  }

  async countTrainsByDayAndStations(
    departureStationId: string,
    arrivalStationId: string,
    dayOfWeek: number
  ): Promise<number> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM train_schedule ts1
      JOIN train_schedule ts2 ON ts1.train_id = ts2.train_id
      WHERE ts1.station_id = $1
        AND ts2.station_id = $2
        AND ts1.day_offset % 7 = $3
        AND ts2.day_offset % 7 = $3
        AND ts1.stop_number < ts2.stop_number
    `, [departureStationId, arrivalStationId, dayOfWeek]);
    
    return parseInt(result.rows[0].count, 10);
  }
}
