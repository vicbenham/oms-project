import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActionType } from '@prisma/client';

export class AddActionDto {
  @ApiProperty({ enum: ActionType, example: ActionType.NOTIFY_USER })
  @IsEnum(ActionType)
  type: ActionType;

  @ApiProperty({ example: 1, description: "Ordre d'exécution" })
  @IsInt()
  @IsPositive()
  order: number;

  //paramètres optionnels spécifiques à certaines actions
  @ApiPropertyOptional({ example: { message: 'Votre commande a été créée' } })
  @IsOptional()
  params?: Record<string, unknown>;
}