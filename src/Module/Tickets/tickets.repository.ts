import { query } from "../../config/database";
import { CustomException } from "../../exception/custom.exception";
import { IUser, UserRole } from "../../Interface/user.interface";
import {
  CreateTicketDto,
  GetTicketByIdAndDate,
  UpdateTicketDto,
} from "./tickets.dto";

export class TicketRepository {
  private tableName = "tickets";

  async createTable(): Promise<void> {
    try {
      await query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        train_id UUID NOT NULL REFERENCES "trains"(train_id),
        departure_station_id UUID NOT NULL REFERENCES "stations"(station_id),
        destination_station_id UUID NOT NULL REFERENCES "stations"(station_id),
        user_id UUID NOT NULL REFERENCES "users"(user_id),
        station_location VARCHAR(100),
        seat_no TEXT NOT NULL,
        passenger_name TEXT NOT NULL,
        passenger_age INTEGER NOT NULL,
        passenger_gender TEXT NOT NULL,
        group_id TEXT ,
        journey_date DATE NOT NULL, -- NEW: Added journey date column
        booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed from TIME to TIMESTAMP
        journey_start_at TIME NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

      // Create index for better performance on date queries
      await query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_journey_date 
      ON ${this.tableName}(journey_date)
    `);

      await query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_train_journey 
      ON ${this.tableName}(train_id, journey_date)
    `);

      console.log(`Table ${this.tableName} created or already exists`);
    } catch (error) {
      console.error(`Error creating table ${this.tableName}:`, error);
      throw error;
    }
  }

  async createTicket(data: CreateTicketDto) {
    try {
      console.log(JSON.stringify(data), "Ticket creation data");

      // Check if journey_date is already in YYYY-MM-DD format
      let formattedJourneyDate: string;

      if (data.journey_date.includes("/")) {
        // Handle DD/MM/YYYY format
        const [day, month, year] = data.journey_date.split("/").map(Number);
        formattedJourneyDate = `${year}-${month
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      } else if (data.journey_date.includes("-")) {
        // Already in YYYY-MM-DD format
        formattedJourneyDate = data.journey_date;
      } else {
        throw new CustomException(
          400,
          "Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY"
        );
      }

      const result = await query(
        `INSERT INTO ${this.tableName} 
       (train_id, departure_station_id, destination_station_id, user_id, seat_no, journey_date, journey_start_at ,passenger_name,passenger_age , passenger_gender , group_id )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
        [
          data.train_id,
          data.departure_station_id,
          data.destination_station_id,
          data.user_id,
          data.seat_no,
          formattedJourneyDate,
          data.journey_start_at,
          data.passenger_name,
          data.passenger_age,
          data.passenger_gender,
          data.group_id,
        ]
      );

      console.log("Ticket created successfully:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating ticket:", error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(500, "Failed to create ticket");
    }
  }

  async getBookedSeatsByTrainIdAndDate(params: GetTicketByIdAndDate) {
    try {
      // Handle different date formats more robustly
      let formattedDate: string;

      if (params.date.includes("/")) {
        const parts = params.date.split("/");
        if (parts[0].length === 4) {
          // yyyy/mm/dd format
          formattedDate = params.date.replace(/\//g, "-");
        } else {
          // dd/mm/yyyy format
          const [day, month, year] = parts;
          formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`;
        }
      } else {
        formattedDate = params.date; // assume already in yyyy-mm-dd format
      }

      // Use parameterized query with proper table name handling
      const result = await query(
        `SELECT 
         t.seat_no,
         t.journey_start_at,
         u.name
       FROM tickets t 
       JOIN users u ON t.user_id = u.user_id
       WHERE t.train_id = $1 
       AND t.journey_date = $2
       ORDER BY t.seat_no`,
        [params.train_id, formattedDate]
      );

      return result.rows;
    } catch (error) {
      console.error("Error finding booked seats by train ID and date:", error);
      throw new CustomException(500, "Failed to retrieve booked seats");
    }
  }

  async getTicketsByUserId(user_id: string) {
    try {
      const result = await query(
        `SELECT 
         t.seat_no,
         t.journey_start_at,
         t.passenger_name,
         t.passenger_age,
         t.passenger_gender,
         t.group_id,
         t.booked_at,
         n.train_name,
         t.ticket_id
       FROM tickets t
       JOIN trains n ON t.train_id = n.train_id 
       WHERE t.user_id = $1 
       ORDER BY t.booked_at`,
        [user_id]
      );

      return result.rows;
    } catch (error) {
      console.error("Error finding booked seats by user_id:", error);
      throw new CustomException(500, "Failed to retrieve booked seats");
    }
  }

  async getTicketById(ticket_id: string) {
    console.log(ticket_id);
    const ticket = await query(`SELECT * FROM tickets WHERE ticket_id = $1`, [
      ticket_id,
    ]);
    console.log(ticket.rows[0]);
    return ticket.rows[0];
  }

  async deleteTicket(ticket_id: string) {
    const ticket = await query(`DELETE FROM tickets WHERE ticket_id = $1`, [
      ticket_id,
    ]);
    return ticket.rows[0];
  }

  async updateTickets(ticket_id: string, data: UpdateTicketDto) {
    const fields = [];
    const values = [];
    let index = 1;
console.log(data)
    if (data.passenger_age) {
      fields.push(`passenger_age = $${index++}`);
      values.push(data.passenger_age);
    }

    if (data.passenger_gender) {
      fields.push(`passenger_gender = $${index++}`);
      values.push(data.passenger_gender);
    }

    if (data.passenger_name) {
      fields.push(`passenger_name = $${index++}`);
      values.push(data.passenger_name);
    }
    values.push(ticket_id);

    // const ticket = await
    const queryText = `
      UPDATE tickets
      SET ${fields.join(", ")}
      WHERE ticket_id = $${index}
      RETURNING *;
    `;

    const result = await query(queryText, values);
    return result.rows[0];
  }
}
