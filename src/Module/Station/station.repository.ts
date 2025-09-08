import { query } from "../../config/database";
import { IUser, UserRole } from "../../Interface/user.interface";
import { CreateStationDto, UpdateStationDto } from "./station.dto";

export class StationRepository {
  private tableName = "stations";

  async createTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          station_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          station_name VARCHAR(50) NOT NULL,
          station_location VARCHAR(100) UNIQUE NOT NULL,
          total_platform INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log(`Table ${this.tableName} created or already exists`);
    } catch (error) {
      console.error(`Error creating table ${this.tableName}:`, error);
    }
  }

  async createStation(data: CreateStationDto) {
    const stations = await query(
      `INSERT INTO stations (station_name,station_location,total_platform)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [data.station_name, data.station_location, data.total_platform]
    );
    return stations.rows[0];
  }

  async findStationById(station_id: string) {
    const station = await query(
      `SELECT * FROM stations WHERE station_id = $1`,
      [station_id]
    );
    console.log(station);
    return station.rows[0];
  }

  async findStationByStationLocation(station_location: string) {
    const station = await query(
      `SELECT * FROM stations WHERE station_location=$1`,
      [station_location]
    );
    return station.rows[0];
  }

  async findStationByStationName(station_name: string) {
    const station = await query(
      `SELECT * FROM stations WHERE station_name = $1`,
      [station_name]
    );
    return station.rows[0];
  }

  async getStation(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit;
    const searchQuery = `%${search.toLowerCase()}%`;
    const station = await query(
      `SELECT * FROM stations 
      WHERE LOWER(station_name) LIKE $1 OR LOWER(station_location) LIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      [searchQuery, limit, offset]
    );
    const total = station.rows.length;

    return { data: station.rows, total, page, limit };
  }

  async deleteStation(station_id: string) {
    const station = await query(`DELETE FROM stations WHERE station_id = $1`, [
      station_id,
    ]);
    return station.rows[0];
  }

  async updateStation(station_id: string, data: UpdateStationDto) {
    // Collect fields to update dynamically
    const fields = [];
    const values = [];
    let index = 1;

    if (data.station_name) {
      fields.push(`station_name = $${index++}`);
      values.push(data.station_name);
    }

    if (data.station_location) {
      fields.push(`station_location = $${index++}`);
      values.push(data.station_location);
    }

    if (data.total_platform !== undefined) {
      fields.push(`total_plaform = $${index++}`);
      values.push(data.total_platform);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(station_id); // for WHERE clause

    const queryText = `
    UPDATE stations
    SET ${fields.join(", ")}
    WHERE station_id = $${index}
    RETURNING *;
  `;

    const result = await query(queryText, values);
    return result.rows[0];
  }
}
