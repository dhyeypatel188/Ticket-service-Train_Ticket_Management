import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateTrainDto {
  @IsNotEmpty()
  @IsString()
  train_name: string;

  @IsNotEmpty()
  @IsNumber()
  total_seats: number;

  @IsNotEmpty()
  @IsNumber()
  seats_per_coach: number;
}

export class UpdateTrainDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  train_name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  total_seats: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  seats_per_coach: number;
}
