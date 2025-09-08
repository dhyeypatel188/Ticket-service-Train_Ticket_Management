import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsTimeZone,
  IsBoolean
} from 'class-validator';

export class CreateTrainScheduleDto {
  @IsNotEmpty()
  @IsString()
  trainId: string;

  @IsNotEmpty()
  @IsString()
  stationId: string;

  @IsNotEmpty()
  @IsNumber()
  stopNumber: number;

  @IsNotEmpty()
  @IsString()
  arrivalTime: string;

  @IsNotEmpty()
  @IsString()
  departureTime: string;

  @IsNotEmpty()
  @IsNumber()
  dayOffset: number;

  @IsNotEmpty()
  @IsBoolean()
  isStart: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isEnd: boolean;
}

export class UpdateTrainScheduleDto {
  @IsOptional()
  @IsNumber()
  trainId?: number;

  @IsOptional()
  @IsNumber()
  stationId?: number;

  @IsOptional()
  @IsNumber()
  stopNumber?: number;

  @IsOptional()
  @IsString()
  arrivalTime?: string;

  @IsOptional()
  @IsString()
  departureTime?: string;

  @IsOptional()
  @IsNumber()
  dayOffset?: number;

  @IsOptional()
  @IsBoolean()
  isStart?: boolean;

  @IsOptional()
  @IsBoolean()
  isEnd?: boolean;
}

export class FindTrainsBetweenStationsDto {
  @IsNotEmpty()
  @IsString()
  departure_station_id: string;

  @IsNotEmpty()
  @IsString()
  arrival_station_id: string;

  @IsNotEmpty()
  @IsString()
  travelDate: string; // Format: YYYY-MM-DD

  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  limit: number = 10;

  @IsOptional()
  @IsBoolean()
  includeSoldOut?: boolean = false;
}

