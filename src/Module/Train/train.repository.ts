import { stat } from "fs";
import { query } from "../../config/database";
import { IUser, UserRole } from "../../Interface/user.interface";
import { CreateTrainDto, UpdateTrainDto } from "./train.dto";
// import { CreateStationDto, UpdateStationDto } from "./station.dto";

export class TrainRepository {
  private tableName = "trains";

  async createTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          train_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          train_name VARCHAR(50) NOT NULL,
          seats_per_coach INTEGER,
          total_seats INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error(`Error creating table ${this.tableName}:`, error);
    }
  }

  async createStation(data: CreateTrainDto) {
    const stations = await query(
      `INSERT INTO trains (train_name,total_seats,seats_per_coach)
          VALUES ($1, $2, $3)
          RETURNING *`,
      [data.train_name, data.total_seats, data.seats_per_coach]
    );
    return stations.rows[0];
  }

  async findTrainById(train_id: string) {
    const result = await query(`SELECT * FROM trains WHERE train_id = $1`, [
      train_id,
    ]);
    console.log(JSON.stringify(result))
    return result.rows[0];
  }

  async findTrainByTrainName(train_name: string) {
    const result = await query(`SELECT * FROM trains WHERE train_name = $1`, [
      train_name,
    ]);
    return result.rows[0];
  }

  async getTrain(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit;
    const searchQuery = `%${search.toLowerCase()}%`;
    const result = await query(
      `SELECT * FROM trains 
      WHERE LOWER(train_name) LIKE $1 
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      [searchQuery, limit, offset]
    );
    const total = result.rows.length;

    return { data: result.rows, total, page, limit };
  }

  async updateTrain(train_id: string, data: UpdateTrainDto) {
    // Collect fields to update dynamically
    const fields = [];
    const values = [];
    let index = 1;

    if (data.train_name) {
      fields.push(`train_name = $${index++}`);
      values.push(data.train_name);
    }

    if (data.seats_per_coach) {
      fields.push(`seats_per_coach = $${index++}`);
      values.push(data.seats_per_coach);
    }

    if (data.total_seats !== undefined) {
      fields.push(`total_seats = $${index++}`);
      values.push(data.total_seats);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(train_id); // for WHERE clause

    const queryText = `
      UPDATE trains
      SET ${fields.join(", ")}
      WHERE train_id = $${index}
      RETURNING *;
    `;

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async deleteTrain(train_id: string) {
    const train = await query(`DELETE FROM trains WHERE train_id = $1`, [
      train_id,
    ]);
    return train.rows[0];
  }
}
