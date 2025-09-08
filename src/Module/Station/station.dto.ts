import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateStationDto {
  @IsNotEmpty()
  @IsString()
  station_name: string;

  @IsNotEmpty()
  @IsString()
  station_location: string;

  @IsNotEmpty()
  @IsNumber()
  total_platform: number;
}

export class UpdateStationDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  station_name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  station_location: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  total_platform: number;
}
