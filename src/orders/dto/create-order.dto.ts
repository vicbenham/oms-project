import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @IsPositive()
  amount: number;
}