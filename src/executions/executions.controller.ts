import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionRepository } from '../engine/repositories/execution.repository';

@ApiTags('Executions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executionRepository: ExecutionRepository) {}

  // Récupère toutes les exécutions d'un workflow donné
  // L'utilisateur ne peut consulter que ses propres workflows (US11)
  @Get('workflow/:workflowId')
  @ApiOperation({ summary: 'Historique des exécutions d\'un workflow' })
  findByWorkflow(@Param('workflowId') workflowId: string) {
    return this.executionRepository.findByWorkflow(workflowId);
  }
}