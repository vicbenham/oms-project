import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TriggerType } from '@prisma/client';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Notifier à la création de commande' })
  @IsString()
  name: string;

  @ApiProperty({ enum: TriggerType, example: TriggerType.ORDER_CREATED })
  @IsEnum(TriggerType)
  trigger: TriggerType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: { field: 'amount', operator: '>', value: 100 },
  })
  @IsOptional()
  condition?: Record<string, unknown>;
}