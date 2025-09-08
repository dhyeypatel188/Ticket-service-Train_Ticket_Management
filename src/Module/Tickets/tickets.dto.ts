import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  train_id: string;

  // @IsNotEmpty()
  // @IsString()
  group_id: string | null;

  @IsNotEmpty()
  @IsString()
  departure_station_id: string;

  @IsNotEmpty()
  @IsString()
  destination_station_id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  seat_no: string;

  @IsNotEmpty()
  @IsString()
  journey_date: string;

  @IsNotEmpty()
  @IsString()
  passenger_name: string;

  @IsNotEmpty()
  @IsNumber()
  passenger_age: number;

  @IsNotEmpty()
  @IsString()
  passenger_gender: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: "journey_start_at must be in HH:MM or HH:MM:SS format",
  })
  journey_start_at: string;
}

export class GetTicketByIdAndDate {
  @IsNotEmpty()
  @IsString()
  train_id: string;

  @IsNotEmpty()
  @IsString()
  date: string;
}

export class UpdateTicketDto{
  
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  passenger_name: string;

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  passenger_age: number;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  passenger_gender: string;
}
