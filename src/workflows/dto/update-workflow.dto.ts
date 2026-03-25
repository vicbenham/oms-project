import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ example: 'Nouveau nom' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: { field: 'amount', operator: '>', value: 100 },
  })
  @IsOptional()
  condition?: Record<string, unknown>;
}